import { useRef, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Message } from "@/types";

interface TranscriptDisplayProps {
  messages: Message[];
  transcriptId?: number;
}

export default function TranscriptDisplay({ messages, transcriptId }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 bg-white"
    >
      <div className="space-y-4 font-mono text-sm">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start recording to begin transcription.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className="flex items-start gap-3"
            >
              <div 
                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                  ${message.speakerType === 'user' ? 'bg-blue-100' : 'bg-purple-100'}`
                }
              >
                <span 
                  className={`text-xs font-semibold
                    ${message.speakerType === 'user' ? 'text-blue-700' : 'text-purple-700'}`
                  }
                >
                  {message.speakerType === 'user' ? 'You' : 'Int.'}
                </span>
              </div>
              
              <div className="flex-1 relative">
                <p className="text-gray-800 leading-relaxed">
                  {message.text}
                </p>
                
                <div className="text-xs text-gray-500 mt-1">
                  {formatTime(new Date(message.timestamp))}
                </div>
                
                {message.isActionItem && (
                  <div className="absolute -left-11 top-0 text-green-500" title="Action item detected">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Currently transcribing indicator */}
        {messages.length > 0 && (
          <div className="p-3 border-l-4 border-primary-500 bg-primary-50 rounded-r-lg">
            <p className="text-sm text-primary-700 font-medium">Currently transcribing...</p>
          </div>
        )}
      </div>
    </div>
  );
}
