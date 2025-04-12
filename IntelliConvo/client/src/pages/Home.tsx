import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import TranscriptPanel from "@/components/transcript/TranscriptPanel";
import InsightsPanel from "@/components/insights/InsightsPanel";
import ExportModal, { ExportOptions } from "@/components/modals/ExportModal";
import { Message, Topic, ActionItem } from "@/types";
import { 
  startRecording, 
  stopRecording, 
  getLastMinute, 
  addEventListener,
  getRecorderState
} from "@/lib/audioRecorder";
import { 
  generateSummary, 
  analyzeText, 
  generateResponseSuggestion, 
  processWhisperInput 
} from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { sendMessage, joinTranscript, addEventListener as addWsListener } from "@/lib/websocket";
import { useMobile } from "@/hooks/use-mobile";

export default function Home() {
  const { toast } = useToast();
  const isMobile = useMobile();
  
  // State for audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  
  // State for transcript data
  const [transcriptId, setTranscriptId] = useState<number | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [summary, setSummary] = useState("");
  const [suggestedResponse, setSuggestedResponse] = useState("");
  
  // UI state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  
  // Create a new transcript
  const createTranscriptMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/transcripts', {
        title: `Conversation ${new Date().toLocaleString()}`,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setTranscriptId(data.id);
      joinTranscript(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/transcripts'] });
    },
    onError: (error) => {
      toast({
        title: "Error creating transcript",
        description: "Could not start a new session. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Add a new message
  const addMessageMutation = useMutation({
    mutationFn: async (message: { transcriptId: number; text: string; speakerType: string; speakerName?: string; }) => {
      const response = await apiRequest('POST', '/api/messages', message);
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, data]);
    },
  });
  
  // Add a new topic
  const addTopicMutation = useMutation({
    mutationFn: async (topic: { transcriptId: number; topic: string; weight: number; }) => {
      const response = await apiRequest('POST', '/api/topics', topic);
      return response.json();
    },
    onSuccess: (data) => {
      setTopics(prev => {
        // Check if topic already exists
        const exists = prev.some(t => t.topic === data.topic);
        if (exists) return prev;
        return [...prev, data];
      });
    },
  });
  
  // Add a new action item
  const addActionItemMutation = useMutation({
    mutationFn: async (actionItem: { transcriptId: number; text: string; messageId?: number; }) => {
      const response = await apiRequest('POST', '/api/action-items', actionItem);
      return response.json();
    },
    onSuccess: (data) => {
      setActionItems(prev => [...prev, data]);
    },
  });
  
  // Toggle action item completion
  const toggleActionItemMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const response = await apiRequest('PATCH', `/api/action-items/${id}`, {
        completed,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setActionItems(prev => 
        prev.map(item => item.id === data.id ? data : item)
      );
    },
  });
  
  // Fetch transcript data if we have an ID
  const { data: transcriptData } = useQuery({
    queryKey: ['/api/transcripts', transcriptId],
    enabled: !!transcriptId,
  });
  
  // Setup audio recording listeners
  useEffect(() => {
    // Listen for audio visualization data
    const removeAudioProcessListener = addEventListener('audioprocess', (data: Uint8Array) => {
      setAudioData(data);
    });
    
    // Listen for recorder status changes
    const removeStatusChangeListener = addEventListener('statuschange', (status: string) => {
      setIsRecording(status === 'recording');
    });
    
    // WebSocket listeners for real-time updates
    const removeMessageListener = addWsListener('new_message', (data) => {
      if (data.message) {
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    });
    
    const removeTopicListener = addWsListener('new_topic', (data) => {
      if (data.topic) {
        setTopics(prev => {
          // Check if topic already exists
          if (prev.some(t => t.id === data.topic.id)) return prev;
          return [...prev, data.topic];
        });
      }
    });
    
    const removeActionItemListener = addWsListener('new_action_item', (data) => {
      if (data.actionItem) {
        setActionItems(prev => {
          // Check if action item already exists
          if (prev.some(a => a.id === data.actionItem.id)) return prev;
          return [...prev, data.actionItem];
        });
      }
    });
    
    const removeUpdatedActionItemListener = addWsListener('updated_action_item', (data) => {
      if (data.actionItem) {
        setActionItems(prev => 
          prev.map(item => item.id === data.actionItem.id ? data.actionItem : item)
        );
      }
    });
    
    // Cleanup
    return () => {
      removeAudioProcessListener();
      removeStatusChangeListener();
      removeMessageListener();
      removeTopicListener();
      removeActionItemListener();
      removeUpdatedActionItemListener();
    };
  }, []);
  
  // Generate summary and analyze text when messages change
  useEffect(() => {
    if (messages.length === 0) return;
    
    // Generate summary
    generateSummary(messages).then(result => {
      setSummary(result.summary);
      
      // Update transcript summary in the database
      if (transcriptId) {
        apiRequest('PATCH', `/api/transcripts/${transcriptId}`, {
          summary: result.summary
        }).catch(console.error);
      }
    });
    
    // Analyze text for topics, action items, and questions
    analyzeText(messages).then(result => {
      // Add new topics
      result.topics.forEach(topic => {
        if (transcriptId) {
          addTopicMutation.mutate({
            transcriptId,
            topic: topic.topic,
            weight: topic.weight
          });
        }
      });
      
      // Add new action items
      result.actionItems.forEach(item => {
        if (transcriptId) {
          addActionItemMutation.mutate({
            transcriptId,
            text: item.text
          });
        }
      });
      
      // Generate response suggestion if we have messages
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        generateResponseSuggestion(messages, lastMessage.text).then(suggestion => {
          setSuggestedResponse(suggestion);
        });
      }
    });
  }, [messages]);
  
  // Handle start recording
  const handleStartRecording = useCallback(async () => {
    try {
      // Create a new transcript if none exists
      if (!transcriptId) {
        createTranscriptMutation.mutate();
      }
      
      await startRecording();
      
      toast({
        title: "Recording started",
        description: "Your conversation is now being recorded and transcribed.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording error",
        description: "Could not start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  }, [transcriptId]);
  
  // Handle stop recording
  const handleStopRecording = useCallback(async () => {
    try {
      const { blob } = await stopRecording();
      
      toast({
        title: "Recording stopped",
        description: "Your conversation has been saved.",
      });
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }, []);
  
  // Handle replay last minute
  const handleReplayLastMinute = useCallback(async () => {
    try {
      const { url } = await getLastMinute();
      
      if (!url) {
        toast({
          title: "Nothing to replay",
          description: "No recent audio available for replay.",
          variant: "destructive",
        });
        return;
      }
      
      // Play the audio
      const audio = new Audio(url);
      audio.play();
      
      toast({
        title: "Replaying last minute",
        description: "Playing back the last minute of conversation.",
      });
    } catch (error) {
      console.error('Error replaying audio:', error);
      toast({
        title: "Replay error",
        description: "Could not replay audio. Please try again.",
        variant: "destructive",
      });
    }
  }, []);
  
  // Handle device selection
  const handleDeviceSelect = useCallback((deviceId: string) => {
    // Will restart recording with the new device if already recording
    if (isRecording) {
      stopRecording().then(() => {
        startRecording(deviceId);
      });
    }
  }, [isRecording]);
  
  // Handle whisper input
  const handleWhisperSubmit = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    try {
      const response = await processWhisperInput(messages, text);
      
      toast({
        title: "AI Assistant",
        description: response,
      });
    } catch (error) {
      console.error('Error processing whisper input:', error);
      toast({
        title: "AI Assistant Error",
        description: "Could not process your request. Please try again.",
        variant: "destructive",
      });
    }
  }, [messages]);
  
  // Handle adding action item
  const handleActionItemAdd = useCallback((text: string) => {
    if (!transcriptId || !text.trim()) return;
    
    addActionItemMutation.mutate({
      transcriptId,
      text
    });
  }, [transcriptId]);
  
  // Handle toggling action item
  const handleActionItemToggle = useCallback((id: number, completed: boolean) => {
    toggleActionItemMutation.mutate({ id, completed });
  }, []);
  
  // Handle export
  const handleExport = useCallback((options: ExportOptions) => {
    toast({
      title: "Export initiated",
      description: `Exporting in ${options.format} format...`,
    });
    
    // In a real app, this would call an API endpoint to generate and deliver the export
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Your export has been processed successfully.",
      });
    }, 2000);
  }, []);
  
  // For demonstration, mock transcription by adding example messages periodically
  // This would be replaced by actual transcription from the audio API
  useEffect(() => {
    if (!isRecording || !transcriptId) return;
    
    const exampleMessages = [
      { text: "Hello, can you tell me more about your experience with microservices?", speakerType: "other" },
      { text: "I've been working with microservices architecture for about 3 years now. We use Docker and Kubernetes for deployment.", speakerType: "user" },
      { text: "That's interesting. What was the biggest challenge in your migration to microservices?", speakerType: "other" },
      { text: "The biggest challenge was maintaining data consistency across services. We implemented a saga pattern to handle distributed transactions.", speakerType: "user" },
    ];
    
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < exampleMessages.length) {
        const msg = exampleMessages[index];
        
        addMessageMutation.mutate({
          transcriptId,
          text: msg.text,
          speakerType: msg.speakerType,
          speakerName: msg.speakerType === 'user' ? 'You' : 'Interviewer'
        });
        
        index++;
      } else {
        clearInterval(interval);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isRecording, transcriptId]);
  
  return (
    <>
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <TranscriptPanel
          transcriptId={transcriptId}
          messages={messages}
          isRecording={isRecording}
          audioData={audioData}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onReplayLastMinute={handleReplayLastMinute}
          onDeviceSelect={handleDeviceSelect}
          className={isMobile ? (messages.length > 0 ? 'hidden' : '') : ''}
        />
        
        <InsightsPanel
          messages={messages}
          summary={summary}
          topics={topics}
          actionItems={actionItems}
          suggestedResponse={suggestedResponse}
          onWhisperSubmit={handleWhisperSubmit}
          onActionItemAdd={handleActionItemAdd}
          onActionItemToggle={handleActionItemToggle}
          className={isMobile ? (messages.length > 0 ? '' : 'hidden') : ''}
        />
      </div>
      
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
      />
    </>
  );
}
