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

  // Store callbacks in refs so they never cause the connect fn to be recreated
  const onMessageRef = useRef(options.onMessage);
  const onConnectRef = useRef(options.onConnect);
  const onDisconnectRef = useRef(options.onDisconnect);
  const reconnectAttemptsRef = useRef(options.reconnectAttempts ?? 5);
  const reconnectIntervalRef = useRef(options.reconnectInterval ?? 3000);

  // Keep refs in sync with latest options on each render
  useEffect(() => {
    onMessageRef.current = options.onMessage;
    onConnectRef.current = options.onConnect;
    onDisconnectRef.current = options.onDisconnect;
    reconnectAttemptsRef.current = options.reconnectAttempts ?? 5;
    reconnectIntervalRef.current = options.reconnectInterval ?? 3000;
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!userId) return;

    if (socketRef.current) {
      socketRef.current.onclose = null;
      socketRef.current.close();
      socketRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    const socket = new WebSocket(`${baseUrl}/ws/${userId}`);

    socket.onopen = () => {
      console.log('WS: Connected');
      setIsConnected(true);
      reconnectCountRef.current = 0;
      onConnectRef.current?.();
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch (err) {
        console.error('WS: Error parsing message', err);
      }
    };

    socket.onclose = () => {
      console.log('WS: Disconnected');
      setIsConnected(false);
      onDisconnectRef.current?.();

      if (reconnectCountRef.current < reconnectAttemptsRef.current) {
        timeoutRef.current = setTimeout(() => {
          reconnectCountRef.current += 1;
          connect();
        }, reconnectIntervalRef.current);
      }
    };

    socketRef.current = socket;
  }, [userId]); // ← only userId; callbacks are accessed via refs

  useEffect(() => {
    connect();
    return () => {
      // Close cleanly and prevent any pending reconnect from firing
      const ws = socketRef.current;
      if (ws) {
        ws.onclose = null; // suppress reconnect on intentional close
        ws.close();
        socketRef.current = null;
      }
      reconnectCountRef.current = reconnectAttemptsRef.current; // exhaust retries
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
