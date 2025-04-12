import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TranscriptPanel from "@/components/transcript/TranscriptPanel";
import InsightsPanel from "@/components/insights/InsightsPanel";
import ContextPrepMode, { ContextData } from "@/components/interview/ContextPrepMode";
import { Message, Topic, ActionItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  startRecording, 
  stopRecording, 
  addEventListener
} from "@/lib/audioRecorder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowRight,
  ChevronRight, 
  User,
  Briefcase,
  Lightbulb,
  BookOpen,
  Code,
  Building,
  FileText,
  GraduationCap,
  MessageSquare,
  Calendar
} from "lucide-react";

// Mock interview questions by category
const INTERVIEW_QUESTIONS = {
  general: [
    "Tell me about yourself and your background.",
    "What are your greatest strengths and weaknesses?",
    "Why do you want to work for our company?",
    "Where do you see yourself in five years?",
    "Describe a challenging situation you faced and how you resolved it."
  ],
  technical: [
    "Explain the difference between REST and GraphQL.",
    "How would you optimize a slow-performing database query?",
    "Describe your experience with containerization technologies.",
    "What CI/CD tools have you worked with?",
    "Walk me through how you would debug a production issue."
  ],
  behavioral: [
    "Tell me about a time you had to work under pressure to meet a deadline.",
    "Describe a situation where you had to collaborate with a difficult team member.",
    "Give an example of a goal you reached and how you achieved it.",
    "Tell me about a time you showed leadership qualities.",
    "How do you handle criticism of your work?"
  ],
  leadership: [
    "How do you motivate team members?",
    "Describe your management style.",
    "How do you delegate responsibilities to your team?",
    "Tell me about a time you had to make a difficult decision.",
    "How do you handle conflicts within your team?"
  ]
};

export default function Interview() {
  const { toast } = useToast();
  const isMobile = useMobile();
  
  // Interview state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interviewType, setInterviewType] = useState<string>("general");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false);
  
  // Context Prep Mode state
  const [showContextPrep, setShowContextPrep] = useState(false);
  const [contextData, setContextData] = useState<ContextData | null>(null);
  
  // Audio and transcript state
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [transcriptId, setTranscriptId] = useState<number | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [summary, setSummary] = useState("");
  const [suggestedResponse, setSuggestedResponse] = useState("");
  
  // Mutations
  const createTranscriptMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest('POST', '/api/transcripts', {
        title,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setTranscriptId(data.id);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not start interview session",
        variant: "destructive",
      });
    },
  });
  
  const addMessageMutation = useMutation({
    mutationFn: async (message: { transcriptId: number; text: string; speakerType: string; speakerName?: string; }) => {
      const response = await apiRequest('POST', '/api/messages', message);
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, data]);
    },
  });
  
  // Setup audio recording listeners
  useEffect(() => {
    const removeAudioProcessListener = addEventListener('audioprocess', (data: Uint8Array) => {
      setAudioData(data);
    });
    
    const removeStatusChangeListener = addEventListener('statuschange', (status: string) => {
      setIsRecording(status === 'recording');
    });
    
    return () => {
      removeAudioProcessListener();
      removeStatusChangeListener();
    };
  }, []);
  
  // Start interview
  const startInterview = useCallback(() => {
    // Create a new transcript with a title based on context if available
    const title = contextData 
      ? `${getInterviewTypeTitle(interviewType)} Interview - ${new Date().toLocaleString()}`
      : `Mock Interview - ${new Date().toLocaleString()}`;
    
    createTranscriptMutation.mutate(title);
    
    // Start with the first question
    setCurrentQuestionIndex(0);
    setInterviewStarted(true);
    setIsDialogOpen(false);
    
    // Start recording
    startRecording().catch(error => {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check your permissions.",
        variant: "destructive",
      });
    });
    
    // If we have context data, add it to the action items
    if (contextData && contextData.keyPoints.length > 0) {
      // We'll add these after the transcript ID is created
      setTimeout(() => {
        if (transcriptId) {
          // Add the first question as a message
          askNextQuestion();
          
          // Add key points as action items
          contextData.keyPoints.forEach(point => {
            handleActionItemAdd(point);
          });
          
          // Show a toast with a helpful tip
          toast({
            title: "Interview Prepared",
            description: "We've added key talking points from your resume and job description to your action items.",
          });
        }
      }, 1000);
    } else {
      // No context data, just ask the first question
      setTimeout(() => {
        if (transcriptId) {
          askNextQuestion();
        }
      }, 1000);
    }
  }, [transcriptId, interviewType, contextData]);
  
  // Ask next question
  const askNextQuestion = useCallback(() => {
    if (!transcriptId || currentQuestionIndex >= INTERVIEW_QUESTIONS[interviewType as keyof typeof INTERVIEW_QUESTIONS].length) {
      return;
    }
    
    const question = INTERVIEW_QUESTIONS[interviewType as keyof typeof INTERVIEW_QUESTIONS][currentQuestionIndex];
    
    setInterviewerSpeaking(true);
    
    // Use speech synthesis to speak the question
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.onend = () => {
      setInterviewerSpeaking(false);
    };
    speechSynthesis.speak(utterance);
    
    // Add the question to messages
    addMessageMutation.mutate({
      transcriptId,
      text: question,
      speakerType: 'other',
      speakerName: 'Interviewer'
    });
  }, [transcriptId, currentQuestionIndex, interviewType]);
  
  // Move to next question
  const handleNextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => prev + 1);
    if (currentQuestionIndex < INTERVIEW_QUESTIONS[interviewType as keyof typeof INTERVIEW_QUESTIONS].length - 1) {
      askNextQuestion();
    } else {
      // End of interview
      toast({
        title: "Interview Complete",
        description: "You've completed all the questions in this interview.",
      });
      
      // Stop recording
      stopRecording();
    }
  }, [currentQuestionIndex, interviewType, askNextQuestion]);
  
  // Effect to ask the next question when transcript ID is set
  useEffect(() => {
    if (transcriptId && interviewStarted && currentQuestionIndex === 0) {
      askNextQuestion();
    }
  }, [transcriptId, interviewStarted, currentQuestionIndex, askNextQuestion]);
  
  // Handle device selection
  const handleDeviceSelect = useCallback((deviceId: string) => {
    // Will restart recording with the new device if already recording
    if (isRecording) {
      stopRecording().then(() => {
        startRecording(deviceId);
      });
    }
  }, [isRecording]);
  
  // Mock function for whisper input
  const handleWhisperSubmit = useCallback((text: string) => {
    toast({
      title: "AI Assistant",
      description: "The AI is analyzing your request...",
    });
    
    // Simulate AI processing time
    setTimeout(() => {
      const responses = [
        "Try highlighting your experience with team leadership and project management.",
        "Focus on how you've handled similar challenges in your previous roles.",
        "Mention specific metrics and outcomes from your past projects.",
        "Consider discussing your approach to problem-solving and collaboration."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      toast({
        title: "AI Suggestion",
        description: randomResponse,
      });
    }, 1500);
  }, []);
  
  // Mock functions for action items
  const handleActionItemAdd = useCallback((text: string) => {
    if (!transcriptId) return;
    
    const newItem: ActionItem = {
      id: Date.now(),
      transcriptId,
      text,
      completed: false
    };
    
    setActionItems(prev => [...prev, newItem]);
  }, [transcriptId]);
  
  const handleActionItemToggle = useCallback((id: number, completed: boolean) => {
    setActionItems(prev => 
      prev.map(item => item.id === id ? { ...item, completed } : item)
    );
  }, []);
  
  // Handle context data completion
  const handleContextComplete = useCallback((data: ContextData) => {
    setContextData(data);
    setShowContextPrep(false);
    setIsDialogOpen(true);
    
    toast({
      title: "Context Analysis Complete",
      description: "Your resume and job description have been analyzed. We'll use this to tailor your interview experience.",
    });
  }, []);
  
  // Handle context prep cancellation
  const handleContextCancel = useCallback(() => {
    setShowContextPrep(false);
    setIsDialogOpen(true);
  }, []);
  
  // Check if we've reached the end of the interview
  const isInterviewComplete = currentQuestionIndex >= INTERVIEW_QUESTIONS[interviewType as keyof typeof INTERVIEW_QUESTIONS].length - 1;

  return (
    <>
      {showContextPrep ? (
        <ContextPrepMode 
          onComplete={handleContextComplete} 
          onCancel={handleContextCancel} 
          mode={contextData?.contextMode || (interviewType === 'general' ? 'general' : 'interview')} 
        />
      ) : !interviewStarted ? (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Interview Practice</h1>
            
            <p className="text-gray-600 mb-8">
              Practice your interview skills with our AI-powered mock interviewer. Select an interview type to get started.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <InterviewTypeCard 
                type="general"
                title="General Interview"
                description="Common questions asked in most job interviews"
                icon={<User className="h-8 w-8 text-blue-500" />}
                onClick={() => {
                  setInterviewType("general");
                  setIsDialogOpen(true);
                }}
              />
              
              <InterviewTypeCard 
                type="technical"
                title="Technical Interview"
                description="Questions focused on technical skills and problem-solving"
                icon={<Code className="h-8 w-8 text-green-500" />}
                onClick={() => {
                  setInterviewType("technical");
                  setIsDialogOpen(true);
                }}
              />
              
              <InterviewTypeCard 
                type="behavioral"
                title="Behavioral Interview"
                description="Questions about past experiences and behaviors"
                icon={<Lightbulb className="h-8 w-8 text-amber-500" />}
                onClick={() => {
                  setInterviewType("behavioral");
                  setIsDialogOpen(true);
                }}
              />
              
              <InterviewTypeCard 
                type="leadership"
                title="Leadership Interview"
                description="Questions for management and leadership roles"
                icon={<Briefcase className="h-8 w-8 text-purple-500" />}
                onClick={() => {
                  setInterviewType("leadership");
                  setIsDialogOpen(true);
                }}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6 mb-6">
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-green-700" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold text-lg">Meeting or Conversation Prep</h3>
                      <p className="text-gray-600">
                        Prepare for any meeting or conversation by gathering context from your calendar, emails, and chats.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-2" 
                        onClick={() => {
                          setContextData({
                            resumeText: "",
                            jobDescriptionText: "",
                            companyInfo: "",
                            keyPoints: [],
                            calendarEvents: [],
                            emailThreads: [],
                            chatMessages: [],
                            contextMode: 'meeting'
                          });
                          setInterviewType("general");
                          setShowContextPrep(true);
                          setInterviewStarted(false);
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Prepare for a Meeting
                      </Button>
                      <Button 
                        variant="outline" 
                        className="mt-2 ml-2" 
                        onClick={() => {
                          setContextData({
                            resumeText: "",
                            jobDescriptionText: "",
                            companyInfo: "",
                            keyPoints: [],
                            calendarEvents: [],
                            emailThreads: [],
                            chatMessages: [],
                            contextMode: 'general'
                          });
                          setInterviewType("general");
                          setShowContextPrep(true);
                          setInterviewStarted(false);
                        }}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Conversation Prep
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  How It Works
                </h3>
                <ul className="list-disc pl-5 text-blue-700 text-sm space-y-1">
                  <li>Select an interview type to begin a practice session</li>
                  <li>The AI will ask you questions from your selected category</li>
                  <li>Respond naturally as you would in a real interview</li>
                  <li>Get real-time feedback and suggested responses</li>
                  <li>Review your performance at the end of the session</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <TranscriptPanel
            transcriptId={transcriptId}
            messages={messages}
            isRecording={isRecording}
            audioData={audioData}
            onStartRecording={() => startRecording()}
            onStopRecording={() => stopRecording()}
            onReplayLastMinute={() => {}}
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
          
          {!interviewerSpeaking && (
            <div className="fixed bottom-24 right-4 z-10">
              <Button 
                size="lg" 
                className="shadow-lg"
                onClick={handleNextQuestion}
                disabled={interviewerSpeaking}
              >
                {isInterviewComplete ? "Finish Interview" : "Next Question"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getInterviewTypeTitle(interviewType)} Interview</DialogTitle>
            <DialogDescription>
              Prepare yourself for a mock interview session. Our AI will ask you questions and provide feedback on your responses.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <FormLabel>Interview Type</FormLabel>
              <Select
                value={interviewType}
                onValueChange={setInterviewType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Interview Types</SelectLabel>
                    <SelectItem value="general">General Interview</SelectItem>
                    <SelectItem value="technical">Technical Interview</SelectItem>
                    <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                    <SelectItem value="leadership">Leadership Interview</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormDescription>
                This session will include {INTERVIEW_QUESTIONS[interviewType as keyof typeof INTERVIEW_QUESTIONS].length} questions.
              </FormDescription>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col items-start space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
            <Button 
              type="button" 
              variant="outline" 
              className="flex items-center" 
              onClick={() => {
                setIsDialogOpen(false);
                setShowContextPrep(true);
              }}
            >
              <FileText className="mr-1 h-4 w-4" />
              Context Prep Mode
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={startInterview}>Start Interview</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface InterviewTypeCardProps {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function InterviewTypeCard({ type, title, description, icon, onClick }: InterviewTypeCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start">
          <div className="mr-4">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
}

function getInterviewTypeTitle(type: string): string {
  switch (type) {
    case 'general': return 'General';
    case 'technical': return 'Technical';
    case 'behavioral': return 'Behavioral';
    case 'leadership': return 'Leadership';
    default: return 'Mock';
  }
}
