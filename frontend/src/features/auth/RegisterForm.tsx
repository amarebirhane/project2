"use client";

import React, { useState } from "react";
import { authService } from "@/features/auth/authService";
import Link from "next/link";
import { User as UserIcon, Mail, Lock, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.register({
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password,
      });

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 animate-fade-in card-premium">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
        <p className="mt-2 text-sm text-slate-500">Join the Smart Productivity revolution</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                required
                className="input-base pl-10"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                required
                className="input-base pl-10"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="relative">
            <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              required
              className="input-base pl-10"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="email"
              required
              className="input-base pl-10"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="password"
              required
              className="input-base pl-10"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>


        <div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center py-3"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Sign up"}
          </button>
        </div>
      </form>
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500 underline-offset-4 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
