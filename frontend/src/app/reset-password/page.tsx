"use client";

import React, { useState } from "react";
import { authService } from "@/features/auth/authService";
import Link from "next/link";
import { Lock, Loader2, Key, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    token: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await authService.resetPassword({
        token: formData.token,
        new_password: formData.new_password,
      });
      setMessage({ type: "success", text: "Password reset successfully! You can now log in." });
      setFormData({ token: "", new_password: "", confirm_password: "" });
    } catch (err: any) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.detail || "Failed to reset password." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md p-8 space-y-8 card-premium">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
            <Key size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Set New Password</h2>
          <p className="mt-2 text-sm text-slate-500">Enter your token and your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-lg text-sm ${
              message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {message.text}
              {message.type === "success" && (
                <div className="mt-2">
                   <Link href="/login" className="font-bold underline">Go to Login</Link>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                required
                className="input-base pl-10"
                placeholder="Paste your reset token here"
                value={formData.token}
                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                className="input-base pl-10"
                placeholder="New Password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                className="input-base pl-10"
                placeholder="Confirm New Password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Reset Password"}
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
