type MessageHandler = (data: any) => void;

// WebSocket instance
let socket: WebSocket | null = null;

// Event listeners
const listeners: { [key: string]: MessageHandler[] } = {
  transcript_data: [],
  new_message: [],
  new_topic: [],
  new_action_item: [],
  updated_action_item: [],
  connection_status: [],
};

// Connection status
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000;

export function initWebSocket(): () => void {
  connectWebSocket();
  
  // Return cleanup function
  return () => {
    if (socket) {
      socket.close();
      socket = null;
    }
  };
}

function connectWebSocket() {
  try {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connection opened');
      isConnected = true;
      reconnectAttempts = 0;
      notifyListeners('connection_status', { connected: true });
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const messageType = data.type;
        
        if (messageType && listeners[messageType]) {
          listeners[messageType].forEach(handler => handler(data));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
      isConnected = false;
      notifyListeners('connection_status', { connected: false });
      
      // Attempt to reconnect
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        setTimeout(connectWebSocket, RECONNECT_DELAY);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnected = false;
      notifyListeners('connection_status', { connected: false, error: true });
    };
    
  } catch (error) {
    console.error('Error creating WebSocket:', error);
  }
}

export function isWebSocketConnected(): boolean {
  return isConnected && socket !== null && socket.readyState === WebSocket.OPEN;
}

export function sendMessage(type: string, data: any): boolean {
  if (!isWebSocketConnected()) {
    return false;
  }
  
  try {
    socket!.send(JSON.stringify({ type, ...data }));
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
}

export function joinTranscript(transcriptId: number): boolean {
  return sendMessage('join_transcript', { transcriptId });
}

export function addEventListener(type: string, handler: MessageHandler): () => void {
  if (!listeners[type]) {
    listeners[type] = [];
  }
  
  listeners[type].push(handler);
  
  // Return function to remove the listener
  return () => {
    listeners[type] = listeners[type].filter(h => h !== handler);
  };
}

function notifyListeners(type: string, data: any) {
  if (listeners[type]) {
    listeners[type].forEach(handler => handler(data));
  }
}
