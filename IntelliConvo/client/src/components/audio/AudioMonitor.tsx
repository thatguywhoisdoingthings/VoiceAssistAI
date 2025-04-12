import React, { useEffect, useRef, useState } from 'react';
import { getRecorderState, addEventListener } from '@/lib/audioRecorder';
import { cn } from '@/lib/utils';

interface AudioMonitorProps {
  className?: string;
}

export default function AudioMonitor({ className }: AudioMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const animationFrameRef = useRef<number>();
  
  useEffect(() => {
    // Check if monitor mode is active
    const recorderState = getRecorderState();
    setIsMonitoring(recorderState.isMonitorModeActive);
    
    // Listen for monitor audio data
    const removeMonitorAudioListener = addEventListener('monitoraudio', (data: Uint8Array) => {
      drawVisualizer(data);
    });
    
    // Listen for status changes
    const removeStatusChangeListener = addEventListener('statuschange', () => {
      const state = getRecorderState();
      setIsMonitoring(state.isMonitorModeActive);
    });
    
    return () => {
      removeMonitorAudioListener();
      removeStatusChangeListener();
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Draw audio visualizer
  const drawVisualizer = (data: Uint8Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = (width / data.length) * 2.5;
    let barHeight;
    let x = 0;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw bars
    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'; // Blue color
    
    for (let i = 0; i < data.length; i++) {
      barHeight = data[i] / 2;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
      gradient.addColorStop(1, 'rgba(96, 165, 250, 0.3)');
      
      ctx.fillStyle = gradient;
      
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
    
    // Add soft glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
  };
  
  return (
    <div className={cn("relative rounded-md border overflow-hidden", className)}>
      {isMonitoring ? (
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
          Monitoring
        </div>
      ) : (
        <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
          Monitor inactive
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        className="w-full h-full bg-gray-100"
      />
      {!isMonitoring && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
          <p className="text-sm text-gray-500">
            Enable Monitor Mode in Settings to visualize audio
          </p>
        </div>
      )}
    </div>
  );
}