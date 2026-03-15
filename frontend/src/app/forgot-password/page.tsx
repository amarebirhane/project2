"use client";

import React, { useState } from "react";
import { authService } from "@/features/auth/authService";
import Link from "next/link";
import { getErrorMessage } from "@/utils/errorHandler";
import { Mail, Loader2, ArrowLeft, Lock, Shield, KeyRound, CheckCircle2 } from "lucide-react";

type Step = "email" | "2fa" | "new-password" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Request reset token
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authService.requestPasswordReset(email);
      setResetToken(res.token);
      setNeeds2FA(res["2fa_required"] ?? false);
      // Skip 2FA step if not required
      setStep(res["2fa_required"] ? "2fa" : "new-password");
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to request password reset."));
    } finally {
      setLoading(false);
    }
  };

  // Step 2a: Verify 2FA code (only if required)
  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Just move to next step — the code will be submitted later with the password
    if (twoFACode.length === 6) setStep("new-password");
    else setError("Please enter a valid 6-digit code.");
  };

  // Step 2b / 3: Set new password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.resetPassword(
        { token: resetToken, new_password: newPassword },
        needs2FA ? twoFACode : undefined
      );
      setStep("done");
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to reset password. Please start over."));
    } finally {
      setLoading(false);
    }
  };

  const stepConfig = {
    email: { title: "Forgot Password?", subtitle: "Enter your email to receive a reset link.", icon: Lock, color: "text-primary-600", bg: "bg-primary-100" },
    "2fa": { title: "Verify Your Identity", subtitle: "Enter the 6-digit code from your authenticator app.", icon: Shield, color: "text-violet-600", bg: "bg-violet-100" },
    "new-password": { title: "Set New Password", subtitle: "Create a strong password for your account.", icon: KeyRound, color: "text-emerald-600", bg: "bg-emerald-100" },
    done: { title: "Password Updated!", subtitle: "Your password has been changed successfully.", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
  };

  const { title, subtitle, icon: Icon, color, bg } = stepConfig[step];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      {/* Progress indicator */}
      {step !== "done" && (
        <div className="flex items-center gap-2 mb-6">
          {["email", needs2FA ? "2fa" : null, "new-password"].filter(Boolean).map((s, i, arr) => (
            <React.Fragment key={s!}>
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                step === s ? "bg-primary-600 w-5" : 
                arr.indexOf(s) < arr.indexOf(step) ? "bg-primary-400" : "bg-slate-200"
              }`} />
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="w-full max-w-md p-8 space-y-8 card-premium animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className={`h-14 w-14 ${bg} rounded-2xl flex items-center justify-center ${color} mb-4 shadow-sm`}>
            <Icon size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
            {error}
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                className="input-base pl-10"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex justify-center items-center">
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Continue"}
            </button>
          </form>
        )}

        {step === "2fa" && (
          <form onSubmit={handle2FASubmit} className="space-y-6">
            <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 text-center">
              <p className="text-xs text-violet-700 font-medium">Your account has 2FA enabled. Enter your authenticator code to verify your identity before resetting your password.</p>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              className="input-base text-center tracking-[0.5em] text-2xl font-bold py-4 w-full"
              placeholder="000000"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />
            <button type="submit" disabled={twoFACode.length !== 6} className="btn-primary w-full py-3">
              Verify Code
            </button>
            <button type="button" onClick={() => setStep("email")} className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Start Over
            </button>
          </form>
        )}

        {step === "new-password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                className="input-base pl-10"
                placeholder="New password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoFocus
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                className="input-base pl-10"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {newPassword && (
              <div className="flex gap-1 mt-1">
                {[4, 6, 8, 10].map((len) => (
                  <div key={len} className={`h-1 flex-1 rounded-full transition-all ${newPassword.length >= len ? "bg-emerald-500" : "bg-slate-200"}`} />
                ))}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex justify-center items-center mt-2">
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Reset Password"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="text-center space-y-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-700">You can now sign in with your new password.</p>
            </div>
            <Link href="/login" className="btn-primary w-full py-3 flex justify-center items-center">
              Back to Sign In
            </Link>
          </div>
        )}

        {step !== "done" && (
          <div className="text-center">
            <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
