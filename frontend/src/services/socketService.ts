type SocketMessage = {
  type: string;
  payload: any;
};

class SocketService {
  private socket: WebSocket | null = null;
  private listeners: Set<(msg: SocketMessage) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private userId: string | null = null;

  connect(userId: string) {
    if (this.socket || !userId) return;
    this.userId = userId;
    
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:8000/ws/${userId}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket Connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const message: SocketMessage = JSON.parse(event.data);
        this.listeners.forEach(listener => listener(message));
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket Disconnected');
      this.socket = null;
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(userId), 2000 * this.reconnectAttempts);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error', error);
      this.socket?.close();
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }

  subscribe(listener: (msg: SocketMessage) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  send(message: SocketMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}

export const socketService = new SocketService();
捉
