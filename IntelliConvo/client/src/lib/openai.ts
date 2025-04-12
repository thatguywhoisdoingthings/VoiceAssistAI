import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

export interface SummaryResponse {
  summary: string;
}

export interface AnalysisResponse {
  topics: { topic: string; weight: number }[];
  actionItems: { text: string }[];
  suggestedQuestions: string[];
}

// Generate a summary of the conversation
export async function generateSummary(messages: { speakerType: string; text: string }[]): Promise<SummaryResponse> {
  try {
    const response = await apiRequest('POST', '/api/analyze/summary', {
      messages,
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error generating summary:', error);
    return { summary: 'Unable to generate summary at this time.' };
  }
}

// Analyze text for topics, action items, and suggested questions
export async function analyzeText(messages: { speakerType: string; text: string }[]): Promise<AnalysisResponse> {
  try {
    const response = await apiRequest('POST', '/api/analyze/text', {
      messages,
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing text:', error);
    return {
      topics: [],
      actionItems: [],
      suggestedQuestions: []
    };
  }
}

// Generate a response suggestion based on the conversation
export async function generateResponseSuggestion(
  messages: { speakerType: string; text: string }[],
  lastMessage: string
): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/analyze/suggest-response', {
      messages,
      lastMessage
    });
    
    const data = await response.json();
    return data.suggestion;
  } catch (error) {
    console.error('Error generating response suggestion:', error);
    return 'Unable to suggest a response at this time.';
  }
}

// Process whisper input for AI assistance
export async function processWhisperInput(
  messages: { speakerType: string; text: string }[],
  whisperText: string
): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/analyze/whisper', {
      messages,
      whisperText
    });
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error processing whisper input:', error);
    return 'Unable to process your request at this time.';
  }
}
