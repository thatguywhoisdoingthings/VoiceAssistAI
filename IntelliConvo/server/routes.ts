import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { 
  insertTranscriptSchema, 
  insertMessageSchema, 
  insertTopicSchema, 
  insertActionItemSchema 
} from "@shared/schema";
import { z } from "zod";

// Mock OpenAI integration for analysis
const analyzeText = (messages: any[]) => {
  // Simple keyword detection
  const text = messages.map(m => m.text).join(' ').toLowerCase();
  const topics = [];
  
  if (text.includes('microservice') || text.includes('service')) {
    topics.push({ topic: 'Microservices', weight: 5 });
  }
  
  if (text.includes('kubernetes') || text.includes('container') || text.includes('docker')) {
    topics.push({ topic: 'Kubernetes', weight: 5 });
    topics.push({ topic: 'Docker', weight: 4 });
  }
  
  if (text.includes('react') || text.includes('frontend') || text.includes('ui')) {
    topics.push({ topic: 'React', weight: 3 });
  }
  
  if (text.includes('node') || text.includes('backend') || text.includes('server')) {
    topics.push({ topic: 'Node.js', weight: 3 });
  }
  
  if (text.includes('aws') || text.includes('cloud')) {
    topics.push({ topic: 'AWS', weight: 3 });
  }
  
  if (text.includes('lead') || text.includes('team') || text.includes('manage')) {
    topics.push({ topic: 'Team Leadership', weight: 3 });
  }
  
  // Simple action item detection
  const actionItems = [];
  if (text.includes('document') || text.includes('documentation') || text.includes('share')) {
    actionItems.push({ text: 'Share migration case study documentation' });
  }
  
  // Simple question suggestion
  const suggestedQuestions = [
    'Could you elaborate on the technical challenges you faced?',
    'How did you measure the success of this project?',
    'What would you do differently next time?'
  ];
  
  return {
    topics,
    actionItems,
    suggestedQuestions
  };
};

const generateSummary = (messages: any[]) => {
  // Very simple summarization
  if (messages.length === 0) return { summary: '' };
  
  if (messages.length <= 2) {
    return { summary: 'Conversation started. Awaiting more dialogue to generate summary.' };
  }
  
  const text = messages.map(m => m.text).join(' ');
  
  if (text.includes('microservice') || text.includes('kubernetes') || text.includes('docker')) {
    return {
      summary: 'Job interview for a senior developer position. The candidate has 5+ years of full-stack development experience with React and Node.js, and currently leads a team at TechSolutions. They have 3 years of experience with containerization (Docker, Kubernetes) and have led a migration from monolithic to microservices architecture. The interviewer is probing for specific examples of challenges faced during the migration.'
    };
  }
  
  return {
    summary: `Conversation with ${messages.length} exchanges. Multiple topics discussed including development, infrastructure, and project experience.`
  };
};

interface ClientData {
  transcriptId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients and their associated transcript
  const clients = new Map<WebSocket, ClientData>();
  
  wss.on('connection', (ws) => {
    // Initialize client data
    clients.set(ws, {});
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch(data.type) {
          case 'join_transcript':
            // Associate client with a transcript
            clients.set(ws, { transcriptId: data.transcriptId });
            
            // Send current transcript data to the client
            if (data.transcriptId) {
              const messages = await storage.getMessages(data.transcriptId);
              const topics = await storage.getTopics(data.transcriptId);
              const actionItems = await storage.getActionItems(data.transcriptId);
              const transcript = await storage.getTranscript(data.transcriptId);
              
              ws.send(JSON.stringify({
                type: 'transcript_data',
                transcript,
                messages,
                topics,
                actionItems
              }));
            }
            break;
            
          case 'new_message':
            // Client sent a new transcript message
            const clientData = clients.get(ws);
            if (data.message && clientData?.transcriptId) {
              // Broadcast the message to all clients in the same transcript
              broadcastToTranscript(clientData.transcriptId, {
                type: 'new_message',
                message: data.message
              });
            }
            break;
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });
  
  // Helper function to broadcast to all clients in a transcript
  function broadcastToTranscript(transcriptId: number, data: any) {
    const message = JSON.stringify(data);
    clients.forEach((clientData, client) => {
      if (clientData.transcriptId === transcriptId && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // API Routes
  
  // Transcripts
  app.get('/api/transcripts', async (req, res) => {
    const transcripts = await storage.getTranscripts();
    res.json(transcripts);
  });
  
  app.get('/api/transcripts/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const transcript = await storage.getTranscript(id);
    
    if (!transcript) {
      return res.status(404).json({ message: 'Transcript not found' });
    }
    
    res.json(transcript);
  });
  
  app.post('/api/transcripts', async (req, res) => {
    try {
      const data = insertTranscriptSchema.parse(req.body);
      const transcript = await storage.createTranscript(data);
      res.status(201).json(transcript);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid transcript data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create transcript' });
    }
  });
  
  app.patch('/api/transcripts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transcript = await storage.updateTranscript(id, req.body);
      
      if (!transcript) {
        return res.status(404).json({ message: 'Transcript not found' });
      }
      
      res.json(transcript);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update transcript' });
    }
  });
  
  // Messages
  app.get('/api/transcripts/:id/messages', async (req, res) => {
    const transcriptId = parseInt(req.params.id);
    const messages = await storage.getMessages(transcriptId);
    res.json(messages);
  });
  
  app.post('/api/messages', async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(data);
      
      // Broadcast the new message to all clients in the transcript
      broadcastToTranscript(message.transcriptId, {
        type: 'new_message',
        message
      });
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid message data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create message' });
    }
  });
  
  // Topics
  app.get('/api/transcripts/:id/topics', async (req, res) => {
    const transcriptId = parseInt(req.params.id);
    const topics = await storage.getTopics(transcriptId);
    res.json(topics);
  });
  
  app.post('/api/topics', async (req, res) => {
    try {
      const data = insertTopicSchema.parse(req.body);
      const topic = await storage.createTopic(data);
      
      // Broadcast the new topic to all clients in the transcript
      broadcastToTranscript(topic.transcriptId, {
        type: 'new_topic',
        topic
      });
      
      res.status(201).json(topic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid topic data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create topic' });
    }
  });
  
  // Action Items
  app.get('/api/transcripts/:id/action-items', async (req, res) => {
    const transcriptId = parseInt(req.params.id);
    const actionItems = await storage.getActionItems(transcriptId);
    res.json(actionItems);
  });
  
  app.post('/api/action-items', async (req, res) => {
    try {
      const data = insertActionItemSchema.parse(req.body);
      const actionItem = await storage.createActionItem(data);
      
      // Broadcast the new action item to all clients in the transcript
      broadcastToTranscript(actionItem.transcriptId, {
        type: 'new_action_item',
        actionItem
      });
      
      res.status(201).json(actionItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid action item data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create action item' });
    }
  });
  
  app.patch('/api/action-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const actionItem = await storage.updateActionItem(id, req.body);
      
      if (!actionItem) {
        return res.status(404).json({ message: 'Action item not found' });
      }
      
      // Broadcast the updated action item to all clients in the transcript
      broadcastToTranscript(actionItem.transcriptId, {
        type: 'updated_action_item',
        actionItem
      });
      
      res.json(actionItem);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update action item' });
    }
  });
  
  // Analysis endpoints
  app.post('/api/analyze/text', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!Array.isArray(messages)) {
        return res.status(400).json({ message: 'Invalid input: messages must be an array' });
      }
      
      const analysis = analyzeText(messages);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: 'Failed to analyze text' });
    }
  });
  
  app.post('/api/analyze/summary', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!Array.isArray(messages)) {
        return res.status(400).json({ message: 'Invalid input: messages must be an array' });
      }
      
      const summary = generateSummary(messages);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate summary' });
    }
  });
  
  app.post('/api/analyze/suggest-response', async (req, res) => {
    try {
      const { messages, lastMessage } = req.body;
      
      // Simple suggestion based on last message
      let suggestion = "I don't have a specific suggestion for that question.";
      
      if (lastMessage.toLowerCase().includes('challenge')) {
        suggestion = "The biggest challenge during our microservices migration was maintaining system stability while incrementally transitioning services. We approached this by:\n\n• Creating a detailed dependency map to identify transition order\n• Implementing an API gateway pattern for routing\n• Using feature flags to control traffic between old and new services\n• Establishing comprehensive monitoring and alerting\n\nThis approach reduced downtime and allowed us to roll back quickly when issues arose.";
      } else if (lastMessage.toLowerCase().includes('experience')) {
        suggestion = "My experience includes leading a team of 5 developers on a major microservices migration project. We successfully decomposed a monolithic application into 12 independent services, resulting in:\n\n• 40% improvement in deployment frequency\n• 60% reduction in mean time to recovery\n• Significant enhancement in our ability to scale individual components\n\nI've worked extensively with Docker, Kubernetes, and AWS ECS for orchestration.";
      }
      
      res.json({ suggestion });
    } catch (error) {
      res.status(500).json({ message: 'Failed to suggest response' });
    }
  });
  
  app.post('/api/analyze/whisper', async (req, res) => {
    try {
      const { whisperText } = req.body;
      
      // Simple processing of whisper input
      let response = "I'll need more context to help you with that.";
      
      if (whisperText.toLowerCase().includes('help')) {
        response = "Try to provide specific examples from your experience that demonstrate the skills mentioned in the job description.";
      } else if (whisperText.toLowerCase().includes('question')) {
        response = "When faced with a challenging question, take a moment to pause and structure your thoughts. Use the STAR method: Situation, Task, Action, Result.";
      } else if (whisperText.toLowerCase().includes('technical')) {
        response = "For technical questions, demonstrate your depth of knowledge by explaining not just what you did, but why certain technical decisions were made and their trade-offs.";
      }
      
      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: 'Failed to process whisper input' });
    }
  });

  return httpServer;
}
