import { useState } from "react";
import { Input } from "@/components/ui/input";
import { MessageSquare, Mic } from "lucide-react";

interface WhisperInputProps {
  onSubmit: (text: string) => void;
}

export default function WhisperInput({ onSubmit }: WhisperInputProps) {
  const [whisperText, setWhisperText] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whisperText.trim()) {
      onSubmit(whisperText);
      setWhisperText("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <div className="sticky bottom-4 bg-white rounded-lg border border-gray-200 shadow-sm mx-4 mb-4">
      <form onSubmit={handleSubmit}>
        <div className="p-3">
          <div className="relative">
            <Input
              value={whisperText}
              onChange={(e) => setWhisperText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full py-2 pl-10 pr-10 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm placeholder-gray-500"
              placeholder="Ask AI for help (Whisper Mode)..."
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MessageSquare className="h-4 w-4 text-accent-500" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Mic className="h-4 w-4 text-gray-400 hover:text-accent-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
