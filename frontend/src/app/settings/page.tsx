"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { authService } from "@/features/auth/authService";
import { 
  Settings as SettingsIcon, 
  Shield, 
  Globe, 
  Bell, 
  User, 
  Save, 
  Loader2, 
  AlertCircle,
  X
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface Setting {
  key: string;
  value: string;
  description?: string;
  is_public: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // 2FA States
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; provisioning_uri: string } | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  // Password Edit States
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings/");
      setSettings(response.data);
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    const originalSettings = [...settings];
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    
    try {
      await api.put(`/settings/${key}`, { value });
      setMessage({ type: "success", text: "Settings saved successfully." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setSettings(originalSettings);
      setMessage({ type: "error", text: "Failed to save settings." });
    }
  };

  const handleSetup2FA = async () => {
    try {
      const data = await authService.setup2FA();
      setSetupData(data);
      setShow2FASetup(true);
      // Generate QR code from provisioning_uri
      setQrCode(data.provisioning_uri);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to initialize 2FA setup." });
    }
  };

  const handleVerify2FA = async () => {
    setSaving(true);
    try {
      await authService.verify2FA(twoFactorCode);
      setMessage({ type: "success", text: "Two-Factor Authentication enabled successfully!" });
      setShow2FASetup(false);
      // Reload user to update global state
      window.location.reload();
    } catch (error) {
      setMessage({ type: "error", text: "Invalid code. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({ old_password: oldPassword, new_password: newPassword });
      setMessage({ type: "success", text: "Password updated successfully." });
      setShowPasswordEdit(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.detail || "Failed to update password." });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  if (user?.role === "admin") {
    tabs.push({ id: "system", label: "System", icon: SettingsIcon });
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
            <p className="text-slate-500">Manage your preferences and system configuration</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-64 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-200" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            <div className="card-premium p-8 animate-fade-in">
              {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                  message.type === "success" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}>
                  {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {message.text}
                </div>
              )}

              {activeTab === "general" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900">Personal Information</h3>
                      <p className="text-sm text-slate-500">Update your account details</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Display Name</label>
                        <input type="text" className="input-base" defaultValue={`${user?.first_name} ${user?.last_name}`} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Email Address</label>
                        <input type="email" className="input-base bg-slate-50" defaultValue={user?.email} disabled />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-slate-900">Security & Authentication</h3>
                    <p className="text-sm text-slate-500">Manage your password and security settings</p>
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-900">Password</h4>
                        <p className="text-xs text-slate-500">Update your account password</p>
                      </div>
                      <button 
                        onClick={() => setShowPasswordEdit(true)}
                        className="btn-primary-outline px-4 py-2 text-sm"
                      >
                        Change Password
                      </button>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                            <Shield size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">Two-Factor Authentication</p>
                            <p className="text-xs text-slate-500">Protect your account with an extra verification layer</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user?.is_two_factor_enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                        }`}>
                          {user?.is_two_factor_enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>

                      {user?.is_two_factor_enabled ? (
                        <p className="text-sm text-slate-600">Your account is secured with 2FA.</p>
                      ) : (
                        <div className="space-y-4">
                          {!show2FASetup ? (
                            <button 
                              onClick={handleSetup2FA}
                              className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                            >
                              Enable 2FA
                            </button>
                          ) : (
                            <div className="space-y-6 pt-2 animate-slide-up">
                              <div className="p-4 bg-white rounded-xl border border-slate-100 flex flex-col items-center">
                                <p className="text-xs font-bold text-slate-700 mb-3">Scan this QR Code with your App</p>
                                {qrCode ? (
                                  <div className="bg-white p-2 border border-slate-100 rounded-lg shadow-sm">
                                    <QRCodeSVG value={qrCode} size={150} level="M" />
                                  </div>
                                ) : (
                                  <Loader2 className="animate-spin text-primary-600" />
                                )}
                                <p className="text-[10px] text-slate-400 mt-2 font-mono">{setupData?.secret}</p>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700">Verification Code</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    maxLength={6}
                                    placeholder="000000"
                                    className="input-base text-center tracking-[0.5em] font-bold" 
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                  />
                                  <button 
                                    onClick={handleVerify2FA}
                                    disabled={twoFactorCode.length !== 6 || saving}
                                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all"
                                  >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : "Verify"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "system" && user?.role === "admin" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-slate-900">System Configuration</h3>
                    <p className="text-sm text-slate-500">Global settings for the platform</p>
                  </div>
                  
                  <div className="space-y-6">
                    {loading ? (
                       <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary-600" /></div>
                    ) : settings.length > 0 ? (
                      settings.map(setting => (
                        <div key={setting.key} className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 flex justify-between">
                            {setting.key.replace(/_/g, " ").toUpperCase()}
                            {setting.is_public && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Public</span>}
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              className="input-base flex-1" 
                              value={setting.value} 
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: newVal } : s));
                              }}
                            />
                            <button 
                              onClick={() => handleUpdate(setting.key, setting.value)}
                              className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
                            >
                              <Save size={18} />
                            </button>
                          </div>
                          {setting.description && <p className="text-xs text-slate-500">{setting.description}</p>}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No system settings found.</p>
                        <button className="mt-4 btn-primary-outline text-xs">Create Initial Settings</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="text-center py-20">
                  <Bell className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="font-bold text-slate-900">Stay Updated</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">Personalize how and when you receive alerts from the platform.</p>
                  <button className="mt-6 btn-primary px-8">Enable Notifications</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Change Password</h3>
                <button onClick={() => setShowPasswordEdit(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="input-base" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="input-base" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="input-base" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setShowPasswordEdit(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleChangePassword}
                    disabled={saving || !oldPassword || !newPassword || newPassword !== confirmPassword}
                    className="flex-1 btn-primary py-2.5 shadow-lg shadow-primary-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
