import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Pause, RotateCcw } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

interface AudioControlsProps {
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  selectedMicId: string;
  selectedSpeakerId: string;
  isRecording: boolean;
  onMicSelect: (deviceId: string) => void;
  onSpeakerSelect: (deviceId: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReplayLastMinute: () => void;
}

export default function AudioControls({
  microphones,
  speakers,
  selectedMicId,
  selectedSpeakerId,
  isRecording,
  onMicSelect,
  onSpeakerSelect,
  onStartRecording,
  onStopRecording,
  onReplayLastMinute
}: AudioControlsProps) {
  const isMobile = useMobile();
  
  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Audio Controls</h2>
          
          {/* Recording Button - More Prominent */}
          <div className="flex items-center gap-2">
            {isRecording ? (
              <Button
                variant="destructive"
                className="rounded-md flex items-center px-4"
                onClick={onStopRecording}
                title="Stop recording"
              >
                <Pause className="h-4 w-4 mr-1" />
                <span>Stop Recording</span>
              </Button>
            ) : (
              <Button
                variant="default"
                className="rounded-md flex items-center px-4 bg-primary hover:bg-primary/90"
                onClick={onStartRecording}
                title="Start recording"
              >
                <Mic className="h-4 w-4 mr-1" />
                <span>Start Recording</span>
              </Button>
            )}
            
            <Button
              size="icon"
              variant="outline"
              className="rounded-full"
              onClick={onReplayLastMinute}
              title="Replay last minute"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="w-full flex flex-wrap items-center gap-3">
          {/* Microphone Select */}
          <div className="relative w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Microphone</label>
            <Select value={selectedMicId} onValueChange={onMicSelect}>
              <SelectTrigger className="w-full py-2 px-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm">
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                {microphones.map((mic) => (
                  <SelectItem key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${microphones.indexOf(mic) + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none" style={{top: "22px"}}>
              <Mic className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {/* Speaker Select */}
          <div className="relative w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Speaker</label>
            <Select value={selectedSpeakerId} onValueChange={onSpeakerSelect}>
              <SelectTrigger className="w-full py-2 px-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm">
                <SelectValue placeholder="Select speaker" />
              </SelectTrigger>
              <SelectContent>
                {speakers.map((speaker) => (
                  <SelectItem key={speaker.deviceId} value={speaker.deviceId}>
                    {speaker.label || `Speaker ${speakers.indexOf(speaker) + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none" style={{top: "22px"}}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            </div>
          </div>
        </div>
        
        {isRecording && (
          <div className="w-full">
            <div className="flex items-center text-sm text-primary">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
              Recording in progress... {isMobile ? "" : "Speak clearly into your microphone"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
