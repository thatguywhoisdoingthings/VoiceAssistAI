import { useState, useEffect } from "react";
import AudioControls from "./AudioControls";
import Waveform from "./Waveform";
import TranscriptDisplay from "./TranscriptDisplay";
import { Message } from "@/types";
import { useMobile } from "@/hooks/use-mobile";
import { Mic } from "lucide-react";

interface TranscriptPanelProps {
  transcriptId?: number;
  messages: Message[];
  isRecording: boolean;
  audioData: Uint8Array | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReplayLastMinute: () => void;
  onDeviceSelect: (deviceId: string) => void;
  className?: string;
}

export default function TranscriptPanel({
  transcriptId,
  messages,
  isRecording,
  audioData,
  onStartRecording,
  onStopRecording,
  onReplayLastMinute,
  onDeviceSelect,
  className = ""
}: TranscriptPanelProps) {
  const isMobile = useMobile();
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("");
  
  useEffect(() => {
    // Get available audio devices
    async function getDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const microphones = devices.filter(device => device.kind === 'audioinput');
        const speakers = devices.filter(device => device.kind === 'audiooutput');
        
        setAudioDevices(devices);
        
        // Set default devices
        if (microphones.length > 0 && !selectedMicId) {
          setSelectedMicId(microphones[0].deviceId);
        }
        
        if (speakers.length > 0 && !selectedSpeakerId) {
          setSelectedSpeakerId(speakers[0].deviceId);
        }
      } catch (error) {
        console.error('Error getting audio devices:', error);
      }
    }
    
    getDevices();
  }, []);
  
  const handleMicSelect = (deviceId: string) => {
    setSelectedMicId(deviceId);
    onDeviceSelect(deviceId);
  };
  
  const handleSpeakerSelect = (deviceId: string) => {
    setSelectedSpeakerId(deviceId);
    // Handle speaker selection logic - would need browser support
  };
  
  return (
    <div className={`flex-1 flex flex-col min-w-0 overflow-hidden border-r border-gray-200 ${className}`}>
      {/* Audio Controls */}
      <AudioControls
        microphones={audioDevices.filter(device => device.kind === 'audioinput')}
        speakers={audioDevices.filter(device => device.kind === 'audiooutput')}
        selectedMicId={selectedMicId}
        selectedSpeakerId={selectedSpeakerId}
        isRecording={isRecording}
        onMicSelect={handleMicSelect}
        onSpeakerSelect={handleSpeakerSelect}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
        onReplayLastMinute={onReplayLastMinute}
      />
      
      {/* Waveform Visualization */}
      <Waveform 
        audioData={audioData} 
        isRecording={isRecording} 
      />
      
      {/* Transcript Display */}
      {messages.length > 0 ? (
        <TranscriptDisplay 
          messages={messages} 
          transcriptId={transcriptId}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-4">Welcome to VoiceAssist AI</h2>
            <p className="text-gray-600 mb-6">
              To get started, click the microphone button above to begin recording your conversation.
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-lg mb-3">Quick Instructions</h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-start">
                  <div className="bg-primary-100 text-primary-800 p-1 rounded-full mr-2 mt-1">
                    <Mic className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium">Start Recording</span>
                    <p className="text-sm text-gray-500">Click the microphone button to start recording</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-destructive/20 text-destructive p-1 rounded-full mr-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause"><rect width="4" height="16" x="6" y="4" rx="1"/><rect width="4" height="16" x="14" y="4" rx="1"/></svg>
                  </div>
                  <div>
                    <span className="font-medium">Stop Recording</span>
                    <p className="text-sm text-gray-500">Click the pause button to stop recording</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-accent/20 text-accent p-1 rounded-full mr-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  </div>
                  <div>
                    <span className="font-medium">Replay</span>
                    <p className="text-sm text-gray-500">Replay the last minute of audio</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <button
              onClick={onStartRecording}
              className="flex items-center justify-center w-full p-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
            >
              <Mic className="h-5 w-5 mr-2" />
              Start Recording
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
