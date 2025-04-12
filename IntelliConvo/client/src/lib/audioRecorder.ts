type AudioRecorderStatus = 'inactive' | 'recording' | 'paused';

export interface RecorderState {
  status: AudioRecorderStatus;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  audioStream: MediaStream | null;
  monitorStream: MediaStream | null;
  audioUrl: string | null;
  audioDuration: number;
  startTime: number | null;
  pauseTime: number | null;
  isMonitorModeActive: boolean;
  monitorDeviceId: string | null;
}

let recorderState: RecorderState = {
  status: 'inactive',
  mediaRecorder: null,
  audioChunks: [],
  audioStream: null,
  monitorStream: null,
  audioUrl: null,
  audioDuration: 0,
  startTime: null,
  pauseTime: null,
  isMonitorModeActive: false,
  monitorDeviceId: null,
};

// Event listeners
const listeners: { [key: string]: Function[] } = {
  statuschange: [],
  audioprocess: [],
  dataavailable: [],
  audiochunk: [],
  monitoraudio: [],
};

// Event emitter
function emit(event: string, ...args: any[]) {
  if (listeners[event]) {
    listeners[event].forEach(listener => listener(...args));
  }
}

// Add event listener
export function addEventListener(event: string, callback: Function) {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(callback);
  
  // Return a function to remove the listener
  return () => {
    listeners[event] = listeners[event].filter(listener => listener !== callback);
  };
}

// Get recorder state
export function getRecorderState(): RecorderState {
  return { ...recorderState };
}

// Request audio devices
export async function getAudioDevices(): Promise<MediaDeviceInfo[]> {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput');
  } catch (error) {
    console.error('Error getting audio devices:', error);
    return [];
  }
}

// Set monitor mode
export function setMonitorMode(active: boolean, deviceId?: string): void {
  recorderState.isMonitorModeActive = active;
  recorderState.monitorDeviceId = deviceId || null;
  
  // If there's an active monitor stream, clean it up
  if (recorderState.monitorStream) {
    recorderState.monitorStream.getTracks().forEach(track => track.stop());
    recorderState.monitorStream = null;
  }
  
  // If enabling monitor mode, start the monitor
  if (active && deviceId) {
    startMonitoring(deviceId).catch(error => {
      console.error('Error starting monitor mode:', error);
      recorderState.isMonitorModeActive = false;
    });
  }
}

// Start monitoring audio from a device
async function startMonitoring(deviceId: string): Promise<void> {
  try {
    // Get audio stream from the monitor device
    const constraints: MediaStreamConstraints = {
      audio: { deviceId: { exact: deviceId } },
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    recorderState.monitorStream = stream;
    
    // Setup audio processing for the monitor stream
    const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    audioSource.connect(analyser);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Process monitor audio
    const processMonitorAudio = () => {
      if (recorderState.isMonitorModeActive) {
        analyser.getByteFrequencyData(dataArray);
        emit('monitoraudio', dataArray);
        requestAnimationFrame(processMonitorAudio);
      }
    };
    
    processMonitorAudio();
    
  } catch (error) {
    console.error('Error starting monitor:', error);
    throw error;
  }
}

// Start recording
export async function startRecording(deviceId?: string): Promise<void> {
  try {
    // If already recording, stop first
    if (recorderState.status !== 'inactive') {
      await stopRecording();
    }
    
    // Get audio stream
    const constraints: MediaStreamConstraints = {
      audio: deviceId ? { deviceId: { exact: deviceId } } : true,
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Create MediaRecorder
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];
    
    // Setup event listeners
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
        emit('audiochunk', event.data);
      }
    };
    
    mediaRecorder.onstart = () => {
      recorderState = {
        ...recorderState,
        status: 'recording',
        startTime: Date.now(),
        mediaRecorder,
        audioStream: stream,
        audioChunks,
      };
      
      // Start monitor mode if it's active
      if (recorderState.isMonitorModeActive && recorderState.monitorDeviceId) {
        // Only start if not already active
        if (!recorderState.monitorStream) {
          startMonitoring(recorderState.monitorDeviceId).catch(error => {
            console.error('Error starting monitor mode during recording:', error);
          });
        }
      }
      
      emit('statuschange', recorderState.status);
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      recorderState = {
        ...recorderState,
        status: 'inactive',
        audioUrl,
        audioDuration: recorderState.startTime ? (Date.now() - recorderState.startTime) : 0,
      };
      
      emit('dataavailable', audioBlob, audioUrl, recorderState.audioDuration);
      emit('statuschange', recorderState.status);
      
      // Clean up audio stream
      if (recorderState.audioStream) {
        recorderState.audioStream.getTracks().forEach(track => track.stop());
      }
      
      // Keep monitor stream running if active, don't stop it automatically
    };
    
    // Start recording
    mediaRecorder.start(100); // Collect data every 100ms
    
    // Setup audio processing for visualization
    const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    audioSource.connect(analyser);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Emit audio processing data periodically
    const processAudio = () => {
      if (recorderState.status === 'recording') {
        analyser.getByteFrequencyData(dataArray);
        emit('audioprocess', dataArray);
        requestAnimationFrame(processAudio);
      }
    };
    
    processAudio();
    
  } catch (error) {
    console.error('Error starting recording:', error);
    throw error;
  }
}

// Pause recording
export function pauseRecording(): void {
  if (recorderState.status === 'recording' && recorderState.mediaRecorder) {
    recorderState.mediaRecorder.pause();
    recorderState = {
      ...recorderState,
      status: 'paused',
      pauseTime: Date.now(),
    };
    emit('statuschange', recorderState.status);
  }
}

// Resume recording
export function resumeRecording(): void {
  if (recorderState.status === 'paused' && recorderState.mediaRecorder) {
    recorderState.mediaRecorder.resume();
    
    // Adjust startTime to account for pause duration
    if (recorderState.startTime && recorderState.pauseTime) {
      const pauseDuration = Date.now() - recorderState.pauseTime;
      recorderState.startTime += pauseDuration;
    }
    
    recorderState = {
      ...recorderState,
      status: 'recording',
      pauseTime: null,
    };
    
    emit('statuschange', recorderState.status);
  }
}

// Stop recording
export function stopRecording(): Promise<{ blob: Blob; url: string; duration: number }> {
  return new Promise((resolve) => {
    if (recorderState.status !== 'inactive' && recorderState.mediaRecorder) {
      const handleDataAvailable = (blob: Blob, url: string, duration: number) => {
        resolve({ blob, url, duration });
        // Remove the listener after it's called
        listeners.dataavailable = listeners.dataavailable.filter(
          listener => listener !== handleDataAvailable
        );
      };
      
      // Add listener for when data is available
      addEventListener('dataavailable', handleDataAvailable);
      
      // Stop the recorder
      recorderState.mediaRecorder.stop();
    } else {
      // No active recording
      resolve({ blob: new Blob(), url: '', duration: 0 });
    }
  });
}

// Get last minute of recording
export function getLastMinute(): Promise<{ blob: Blob; url: string; duration: number }> {
  return new Promise((resolve) => {
    if (recorderState.audioChunks.length === 0) {
      resolve({ blob: new Blob(), url: '', duration: 0 });
      return;
    }
    
    // Create a blob from the chunks
    const audioBlob = new Blob(recorderState.audioChunks, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Get the duration (capped at 60 seconds)
    const duration = Math.min(60000, recorderState.audioDuration || 0);
    
    resolve({ blob: audioBlob, url: audioUrl, duration });
  });
}

// Clean up resources
export function cleanup(): void {
  // Stop and clean up audio stream
  if (recorderState.audioStream) {
    recorderState.audioStream.getTracks().forEach(track => track.stop());
  }
  
  // Stop and clean up monitor stream
  if (recorderState.monitorStream) {
    recorderState.monitorStream.getTracks().forEach(track => track.stop());
  }
  
  if (recorderState.audioUrl) {
    URL.revokeObjectURL(recorderState.audioUrl);
  }
  
  recorderState = {
    status: 'inactive',
    mediaRecorder: null,
    audioChunks: [],
    audioStream: null,
    monitorStream: null,
    audioUrl: null,
    audioDuration: 0,
    startTime: null,
    pauseTime: null,
    isMonitorModeActive: false,
    monitorDeviceId: null,
  };
  
  emit('statuschange', recorderState.status);
}
