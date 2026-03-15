import api from './api';
import { TaskShare } from '../types/task';

export const collaborationService = {
  shareTask: async (taskId: string, userId: string, permission: "read" | "write" = "read") => {
    const response = await api.post<TaskShare>('/collaboration/share', {
      task_id: taskId,
      user_id: userId,
      permission,
    });
    return response.data;
  },

  getTaskCollaborators: async (taskId: string) => {
    const response = await api.get<TaskShare[]>(`/collaboration/task/${taskId}`);
    return response.data;
  },

  unshareTask: async (shareId: string) => {
    const response = await api.delete(`/collaboration/unshare/${shareId}`);
    return response.data;
  },
};

export default collaborationService;
