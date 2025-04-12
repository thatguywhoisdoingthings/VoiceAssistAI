// User type
export interface User {
  id: number;
  username: string;
  password: string;
}

// Transcript type
export interface Transcript {
  id: number;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  summary?: string;
  userId?: number;
}

// Message type
export interface Message {
  id: number;
  transcriptId: number;
  text: string;
  speakerType: string; // 'user' or 'other'
  speakerName?: string;
  timestamp: string | Date;
  isActionItem: boolean;
}

// Topic type
export interface Topic {
  id: number;
  transcriptId: number;
  topic: string;
  weight: number;
}

// Action Item type
export interface ActionItem {
  id: number;
  transcriptId: number;
  messageId?: number;
  text: string;
  completed: boolean;
}

// Audio device type
export interface AudioDevice {
  id: string;
  label: string;
  type: 'input' | 'output';
}

// App settings type
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  audioInputDevice: string;
  audioOutputDevice: string;
  transcriptionEnabled: boolean;
  aiModel: 'chatgpt' | 'gemini' | 'claude' | 'auto';
  privacyMode: boolean;
  monitorMode?: boolean;
  monitorDevice?: string;
  hotkeys: {
    startRecording: string;
    stopRecording: string;
    replayLastMinute: string;
    toggleSpeaker: string;
  };
}

// Export options type
export interface ExportOptions {
  format: 'markdown' | 'pdf' | 'gdocs' | 'notion' | 'email';
  includeTranscript: boolean;
  includeSummary: boolean;
  includeTopics: boolean;
  includeActionItems: boolean;
}

// WebSocket message types
export type WebSocketMessage = {
  type: string;
  [key: string]: any;
};
