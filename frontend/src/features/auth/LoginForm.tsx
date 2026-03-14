"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/features/auth/authService";
import { getErrorMessage } from "@/utils/errorHandler";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login({
        username: identifier,
        password: password,
      });
      await login(data.access_token);
    } catch (err: any) {
      setError(getErrorMessage(err, "Login failed. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 animate-fade-in card-premium">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="mt-2 text-sm text-slate-500">Sign in to your productivity suite</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              required
              className="input-base pl-10"
              placeholder="Email or Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              className="input-base pl-10 pr-10"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            Forgot password?
          </Link>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center py-3"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Sign in"}
          </button>
        </div>
      </form>
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500 underline-offset-4 hover:underline">
            Register for free
          </Link>
        </p>
      </div>
    </div>
  );
}
