"use client";

import React, { useState } from "react";
import { authService } from "@/features/auth/authService";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, Lock as LockIcon } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await authService.requestPasswordReset(email);
      // In a real app, we show "Check your email"
      // But for this project, we might display the token for demo purposes if needed
      setMessage({ 
        type: "success", 
        text: `Request successful! In a real app, an email would be sent. Token: ${res.token}` 
      });
    } catch (err: any) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.detail || "Failed to request password reset." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md p-8 space-y-8 card-premium">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4">
            <LockIcon size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot Password?</h2>
          <p className="mt-2 text-sm text-slate-500">No worries, we&apos;ll help you reset it.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-lg text-sm break-all ${
              message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {message.text}
              {message.type === "success" && (
                <div className="mt-2">
                   <Link href="/reset-password" className="font-bold underline">Go to Reset Page</Link>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="email"
              required
              className="input-base pl-10"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
