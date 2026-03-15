import api from "@/services/api";
import { AuthResponse, User } from "@/types/user";

export const authService = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const params = new URLSearchParams();
    params.append("username", credentials.username);
    params.append("password", credentials.password);

    const response = await api.post<AuthResponse>("/auth/login", params.toString(), {
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

  logout: async (): Promise<void> => {
    // Call backend to register logout in audit log
    await api.post("/auth/logout");
  },

  clearToken: () => {
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

  requestPasswordReset: async (email: string): Promise<{ msg: string; token: string; "2fa_required": boolean }> => {
    const response = await api.post("/auth/password-reset/request", { email });
    return response.data;
  },

  resetPassword: async (data: { token: string; new_password: string }, twoFACode?: string): Promise<any> => {
    const url = twoFACode
      ? `/auth/password-reset/reset?code=${twoFACode}`
      : "/auth/password-reset/reset";
    const response = await api.post(url, data);
    return response.data;
  },

  setup2FA: async (): Promise<{ secret: string; provisioning_uri: string }> => {
    const response = await api.post("/auth/2fa/setup");
    return response.data;
  },

  verify2FA: async (code: string): Promise<any> => {
    const response = await api.post(`/auth/2fa/verify?code=${code}`);
    return response.data;
  },

  login2FA: async (userId: string, code: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(`/auth/2fa/login?user_id=${userId}&code=${code}`);
    return response.data;
  },
};
