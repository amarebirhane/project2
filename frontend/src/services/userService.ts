import api from "@/services/api";
import { User } from "@/types/user";
import { PaginatedResponse } from "@/types/pagination";

export const userService = {
  getUsers: async (page = 1, limit = 8) => {
    const skip = (page - 1) * limit;
    const response = await api.get<PaginatedResponse<User>>("/users/", { params: { skip, limit } });
    return response.data;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/users/${id}`);
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  createUser: async (user: any) => {
    const response = await api.post<User>("/auth/register", user);
    return response.data;
  },
};
