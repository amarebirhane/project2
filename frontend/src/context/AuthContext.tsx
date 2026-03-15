"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/user";
import { authService } from "@/features/auth/authService";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const data = await authService.getMe();
      setUser(data);
    } catch (error) {
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token: string) => {
    authService.setToken(token);
    await fetchUser();
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      // Call backend to register logout in audit log
      await authService.logout();
    } catch {
      // Ignore errors - always clear local session
    }
    authService.clearToken();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
