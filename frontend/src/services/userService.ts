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

  updateMe: async (data: Partial<User>) => {
    const response = await api.put<User>("/users/me", data);
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<User>("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  exportUsersCSV: async () => {
    const response = await api.get("/users/export/csv", {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
