import { useEffect } from 'react';
import { socketService } from '@/services/socketService';
import { useAuth } from '@/context/AuthContext';

export const useSocket = (onMessage?: (type: string, payload: any) => void) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      socketService.connect(user.id);
    }
    
    if (onMessage) {
      const unsubscribe = socketService.subscribe((msg) => {
        onMessage(msg.type, msg.payload);
      });
      return unsubscribe;
    }
  }, [user?.id, onMessage]);

  return socketService;
};
