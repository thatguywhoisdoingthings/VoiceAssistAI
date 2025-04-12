import { useRef, useEffect } from "react";

interface WaveformProps {
  audioData: Uint8Array | null;
  isRecording: boolean;
}

export default function Waveform({ audioData, isRecording }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !audioData) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw waveform bars only if recording
    if (isRecording) {
      const barWidth = 3;
      const barGap = 2;
      const totalBars = Math.min(40, Math.floor(canvas.width / (barWidth + barGap)));
      const centerY = canvas.height / 2;
      
      // Set color
      ctx.fillStyle = '#3B82F6';
      
      // Draw bars
      for (let i = 0; i < totalBars; i++) {
        const dataIndex = Math.floor(i * audioData.length / totalBars);
        const value = audioData[dataIndex] || 0;
        const barHeight = (value / 255) * canvas.height * 0.8;
        
        const x = i * (barWidth + barGap);
        const y = centerY - barHeight / 2;
        
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    } else {
      // Draw flat line when not recording
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
  }, [audioData, isRecording]);
  
  return (
    <div className={`relative h-[60px] w-full bg-gray-50 border-b border-gray-200 ${!isRecording ? 'opacity-50' : ''}`}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        width={400}
        height={60}
      />
    </div>
  );
}
