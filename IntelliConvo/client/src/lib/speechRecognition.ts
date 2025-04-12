interface SpeechResult {
  text: string;
  isFinal: boolean;
  speakerType: string;
}

type SpeechRecognitionCallback = (result: SpeechResult) => void;

// Check if the browser supports Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

class SpeechRecognitionService {
  private recognition: any;
  private isListening: boolean = false;
  private currentSpeaker: string = 'user';
  private onResultCallback: SpeechRecognitionCallback | null = null;
  private onEndCallback: (() => void) | null = null;
  private continuous: boolean = true;
  
  constructor() {
    if (!SpeechRecognition) {
      console.error('Speech Recognition API is not supported in this browser');
      return;
    }
    
    this.initRecognition();
  }
  
  private initRecognition() {
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = this.continuous;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    // Set up event handlers
    this.recognition.onresult = this.handleResult.bind(this);
    this.recognition.onend = this.handleEnd.bind(this);
    this.recognition.onerror = this.handleError.bind(this);
  }
  
  private handleResult(event: any) {
    const results = event.results;
    const resultIndex = event.resultIndex;
    
    for (let i = resultIndex; i < results.length; i++) {
      const transcript = results[i][0].transcript;
      const isFinal = results[i].isFinal;
      
      if (this.onResultCallback) {
        this.onResultCallback({
          text: transcript,
          isFinal,
          speakerType: this.currentSpeaker
        });
      }
    }
  }
  
  private handleEnd() {
    if (this.isListening && this.continuous) {
      // Restart if continuous mode is enabled
      this.recognition.start();
    } else {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    }
  }
  
  private handleError(event: any) {
    console.error('Speech Recognition Error:', event.error);
    
    // Handle "no-speech" error by restarting
    if (event.error === 'no-speech' && this.isListening) {
      this.recognition.stop();
      setTimeout(() => {
        if (this.isListening) {
          this.recognition.start();
        }
      }, 500);
    }
  }
  
  public start(deviceId?: string): boolean {
    if (!this.recognition) return false;
    
    try {
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }
  
  public stop(): void {
    if (!this.recognition) return;
    
    this.isListening = false;
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }
  
  public toggleSpeaker(): string {
    this.currentSpeaker = this.currentSpeaker === 'user' ? 'other' : 'user';
    return this.currentSpeaker;
  }
  
  public setSpeaker(speaker: string): void {
    this.currentSpeaker = speaker;
  }
  
  public getCurrentSpeaker(): string {
    return this.currentSpeaker;
  }
  
  public isSupported(): boolean {
    return !!SpeechRecognition;
  }
  
  public setContinuous(continuous: boolean): void {
    this.continuous = continuous;
    if (this.recognition) {
      this.recognition.continuous = continuous;
    }
  }
  
  public onResult(callback: SpeechRecognitionCallback): void {
    this.onResultCallback = callback;
  }
  
  public onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }
}

// Create a singleton instance
const speechRecognition = new SpeechRecognitionService();
export default speechRecognition;
