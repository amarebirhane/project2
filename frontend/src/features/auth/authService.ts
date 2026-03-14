import api from "@/services/api";
import { AuthResponse, User } from "@/types/user";

export const authService = {
  login: async (formData: FormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  register: async (userData: any): Promise<User> => {
    const response = await api.post<User>("/auth/register", userData);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/users/me");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  setToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  updateProfile: async (data: any): Promise<User> => {
    const response = await api.put<User>("/users/me", data);
    return response.data;
  },

  changePassword: async (data: any): Promise<any> => {
    const response = await api.patch("/users/me/password", data);
    return response.data;
  },

  requestPasswordReset: async (email: string): Promise<any> => {
    const response = await api.post("/auth/password-reset/request", { email });
    return response.data;
  },

  resetPassword: async (data: any): Promise<any> => {
    const response = await api.post("/auth/password-reset/reset", data);
    return response.data;
  },
};
