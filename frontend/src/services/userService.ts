import api from "@/services/api";
import { User } from "@/types/user";

export const userService = {
  getUsers: async (skip = 0, limit = 100) => {
    const response = await api.get<User[]>("/users/", { params: { skip, limit } });
    return response.data;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/users/${id}`);
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },
};
