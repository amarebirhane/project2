import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export const useWebSocket = (userId: string | undefined, options: UseWebSocketOptions = {}) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectCountRef = useRef(0);

  const connect = useCallback(() => {
    if (!userId) return;

    // Use environment variable for base URL if available, else fallback
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    const socket = new WebSocket(`${baseUrl}/ws/${userId}`);

    socket.onopen = () => {
      console.log('WS: Connected');
      setIsConnected(true);
      reconnectCountRef.current = 0;
      options.onConnect?.();
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        options.onMessage?.(data);
      } catch (err) {
        console.error('WS: Error parsing message', err);
      }
    };

    socket.onclose = () => {
      console.log('WS: Disconnected');
      setIsConnected(false);
      options.onDisconnect?.();

      // Simple reconnect logic
      const maxAttempts = options.reconnectAttempts ?? 5;
      if (reconnectCountRef.current < maxAttempts) {
        setTimeout(() => {
          reconnectCountRef.current += 1;
          connect();
        }, options.reconnectInterval ?? 3000);
      }
    };

    socketRef.current = socket;
  }, [userId, options]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { isConnected, sendMessage };
};

export default useWebSocket;
