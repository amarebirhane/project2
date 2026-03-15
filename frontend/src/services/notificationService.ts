import api from './api';

export interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  user_id: string;
  created_at: string;
}

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/');
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<Notification[]> => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};
