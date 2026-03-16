"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/features/auth/authService";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { getErrorMessage } from "@/utils/errorHandler";
import { useToasts } from "@/components/Toast";
import { User as UserIcon, UserCheck, Mail, Loader2, Save, Camera } from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await authService.updateProfile(formData);
      setUser(updatedUser);
      addToast("Profile updated successfully!", "success");
    } catch (err: any) {
      addToast(getErrorMessage(err, "Failed to update profile."), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex-shrink-0">
            <AvatarUpload 
              currentUrl={user?.profile_image_url} 
              onUploadSuccess={(newUrl) => {
                if (user) {
                  setUser({ ...user, profile_image_url: newUrl });
                }
              }}
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your personal identity and platform preferences</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-primary-200 dark:border-primary-800">
                {user?.role} Account
              </span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-700">
                ID: {user?.id.toString().substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Username</label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    className="input-base pl-10"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    className="input-base pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">First Name</label>
                <input
                  type="text"
                  className="input-base"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Last Name</label>
                <input
                  type="text"
                  className="input-base"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2 px-6 py-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
