"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { userService } from "@/services/userService";
import { notificationService, Notification } from "@/services/notificationService";
import { TableSkeleton } from "@/components/Skeletons";
import { useToasts } from "@/components/Toast";
import api from "@/services/api";
import { authService } from "@/features/auth/authService";
import { 
  Settings as SettingsIcon, Shield, Globe, Bell, User, Save, Loader2, AlertCircle, X, Lock, CheckCircle2, Sun, Moon, Monitor, Palette, Database, DownloadCloud, Trash2, Plus, RefreshCcw, History, Info, Mail, Camera, Eye, EyeOff
} from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";
import { useTheme } from "@/context/ThemeContext";
import { QRCodeSVG } from "qrcode.react";
import { backupService } from "@/services/backupService";
import { format } from "date-fns";

interface Setting {
  key: string;
  value: string;
  description?: string;
  is_public: boolean;
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToasts();
  
  // 2FA States
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; provisioning_uri: string } | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  
  // Notification States
  const [history, setHistory] = useState<Notification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [prefs, setPrefs] = useState({
    email_notifications: user?.email_notifications ?? true,
    push_notifications: user?.push_notifications ?? true,
    task_updates: user?.task_updates ?? true,
    system_alerts: user?.system_alerts ?? true
  });

  // Password Edit States
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Backup States
  const [backups, setBackups] = useState<string[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await notificationService.getNotifications();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch notification history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdatePrefs = async () => {
    setSaving(true);
    try {
      await userService.updateMe(prefs);
      addToast("Preferences updated", "success");
    } catch (error) {
      console.error("Failed to update preferences", error);
      addToast("Failed to update preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const data = await backupService.getBackups();
      setBackups(data);
    } catch (error) {
      addToast("Failed to fetch backups.", "error");
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    if (activeTab === "backups" && user?.role === "admin") {
      fetchBackups();
    }
  }, [activeTab, user]);

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
      addToast("Settings saved successfully.", "success");
    } catch (error) {
      setSettings(originalSettings);
      addToast("Failed to save settings.", "error");
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
      addToast("Failed to initialize 2FA setup.", "error");
    }
  };

  const handleVerify2FA = async () => {
    setSaving(true);
    try {
      await authService.verify2FA(twoFactorCode);
      addToast("Two-Factor Authentication enabled successfully!", "success");
      setShow2FASetup(false);
      // Reload user to update global state
      window.location.reload();
    } catch (error) {
      addToast("Invalid code. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      addToast("New passwords do not match.", "error");
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({ old_password: oldPassword, new_password: newPassword });
      addToast("Password updated successfully.", "success");
      setShowPasswordEdit(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      addToast(error.response?.data?.detail || "Failed to update password.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      await backupService.createBackup();
      addToast("Backup created successfully.", "success");
      fetchBackups();
    } catch (error) {
      addToast("Failed to create backup.", "error");
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete backup ${filename}?`)) return;
    try {
      await backupService.deleteBackup(filename);
      addToast("Backup deleted successfully.", "success");
      fetchBackups();
    } catch (error) {
      addToast("Failed to delete backup.", "error");
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  if (user?.role === "admin") {
    tabs.push({ id: "system", label: "System", icon: SettingsIcon });
    tabs.push({ id: "backups", label: "Backups", icon: Database });
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Account Settings</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your preferences and system configuration</p>
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
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-none" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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

              {activeTab === "general" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">Personal Information</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Update your account details</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8 items-start">
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
                    
                    <div className="flex-1 w-full space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Display Name</label>
                            <input type="text" className="input-base dark:bg-slate-900/50 dark:border-slate-700" defaultValue={`${user?.first_name} ${user?.last_name}`} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                            <input type="email" className="input-base bg-slate-50 dark:bg-slate-800 dark:border-slate-700" defaultValue={user?.email} disabled />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Appearance Settings</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Customize how the platform looks for you</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light', icon: Sun, desc: 'Classic bright look' },
                      { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easier on the eyes' },
                      { id: 'system', label: 'System', icon: Monitor, desc: 'Follow device theme' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setTheme(mode.id as any)}
                        className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-4 ${
                          theme === mode.id
                            ? "border-primary-600 bg-primary-50/50 dark:bg-primary-900/20"
                            : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
                        }`}
                      >
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          theme === mode.id 
                            ? "bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-none" 
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
                        }`}>
                          <mode.icon size={24} />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${theme === mode.id ? "text-primary-900 dark:text-primary-100" : "text-slate-900 dark:text-slate-100"}`}>
                            {mode.label} Mode
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{mode.desc}</p>
                        </div>
                      </button>
                    ))}
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
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                            <Lock size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Account Password</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Update your account password</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowPasswordEdit(true);
                          }}
                          className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 dark:shadow-none"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                            <Shield size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Two-Factor Authentication</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Protect your account with an extra verification layer</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user?.is_two_factor_enabled ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}>
                          {user?.is_two_factor_enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>

                      {user?.is_two_factor_enabled ? (
                        <p className="text-sm text-slate-600">Your account is secured with 2FA.</p>
                      ) : (
                        <div className="space-y-4">
                          <button 
                            onClick={handleSetup2FA}
                            className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                          >
                            Enable 2FA
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "system" && user?.role === "admin" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">System Configuration</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Global settings for the platform</p>
                  </div>
                  
                  <div className="space-y-6">
                    {loading ? (
                       <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary-600" /></div>
                    ) : settings.length > 0 ? (
                      settings.map(setting => (
                        <div key={setting.key} className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                            {setting.key.replace(/_/g, " ").toUpperCase()}
                            {setting.is_public && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">Public</span>}
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              className="input-base dark:bg-slate-900/50 dark:border-slate-700 flex-1" 
                              value={setting.value} 
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: newVal } : s));
                              }}
                            />
                            <button 
                              onClick={() => handleUpdate(setting.key, setting.value)}
                              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                            >
                              <Save size={18} />
                            </button>
                          </div>
                          {setting.description && <p className="text-xs text-slate-500 dark:text-slate-400">{setting.description}</p>}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400">No system settings found.</p>
                        <button className="mt-4 btn-primary-outline text-xs">Create Initial Settings</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "backups" && user?.role === "admin" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">Database Backups</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Create and manage your database snapshots</p>
                    </div>
                    <button 
                      onClick={handleCreateBackup}
                      disabled={creatingBackup}
                      className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm shadow-lg shadow-primary-200"
                    >
                      {creatingBackup ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                      Create New Backup
                    </button>
                  </div>

                  <div className="space-y-4">
                    {loadingBackups ? (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Loader2 className="animate-spin text-primary-600" size={32} />
                        <p className="text-sm font-medium">Scanning backup directory...</p>
                      </div>
                    ) : backups.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {backups.map(filename => (
                          <div key={filename} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-100 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors">
                                <History size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{filename}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                  {filename.includes('_') ? format(new Date(
                                    parseInt(filename.split('_')[1].substring(0, 4)), 
                                    parseInt(filename.split('_')[1].substring(4, 6)) - 1, 
                                    parseInt(filename.split('_')[1].substring(6, 8))
                                  ), 'PPP') : 'Snapshot'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a 
                                href={backupService.getDownloadUrl(filename)}
                                download
                                className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all tooltip"
                                title="Download"
                              >
                                <DownloadCloud size={18} />
                              </a>
                              <button 
                                onClick={() => handleDeleteBackup(filename)}
                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Database className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">No Backups Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mt-2">
                          Protect your data by creating periodic snapshots of your database.
                        </p>
                        <button 
                          onClick={handleCreateBackup}
                          className="mt-6 btn-primary-outline text-xs px-8"
                        >
                          Trigger First Backup
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-10 animate-fade-in">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Notification Preferences</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Choose how you want to be alerted</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'email_notifications', label: 'Email Alerts', icon: Mail, desc: 'Get updates in your inbox' },
                      { id: 'push_notifications', label: 'Browser Notifications', icon: Bell, desc: 'Real-time desktop alerts' },
                      { id: 'task_updates', label: 'Task Activity', icon: CheckCircle2, desc: 'When tasks are assigned/updated' },
                      { id: 'system_alerts', label: 'System Announcements', icon: Info, desc: 'Critical platform updates' },
                    ].map((pref) => (
                      <div key={pref.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                            <pref.icon size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{pref.label}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{pref.desc}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setPrefs(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof typeof prev] }))}
                          className={`w-12 h-6 rounded-full transition-all relative ${prefs[pref.id as keyof typeof prefs] ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs[pref.id as keyof typeof prefs] ? 'right-1' : 'left-1'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={handleUpdatePrefs}
                      disabled={saving}
                      className="btn-primary px-8 py-2.5 flex items-center gap-2"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Save Preferences
                    </button>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">Recent Activity</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Your latest platform notifications</p>
                      </div>
                      <button onClick={fetchHistory} className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                        <RefreshCcw size={18} className={loadingHistory ? 'animate-spin' : ''} />
                      </button>
                    </div>

                    {loadingHistory ? (
                      <TableSkeleton rows={3} />
                    ) : history.length > 0 ? (
                      <div className="space-y-3">
                        {history.slice(0, 5).map(notification => (
                          <div key={notification.id} className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${notification.is_read ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-primary-50/30 dark:bg-primary-900/10 border-primary-100 dark:border-primary-800'}`}>
                            <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${notification.is_read ? 'bg-slate-100 text-slate-400' : 'bg-primary-100 text-primary-600'}`}>
                              <Bell size={14} />
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm ${notification.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100 font-medium'}`}>
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold tracking-wider">
                                {format(new Date(notification.created_at), 'PPPp')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No recent notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordEdit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm cursor-pointer" onClick={() => setShowPasswordEdit(false)}></div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up relative z-10">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Change Password</h3>
                <button onClick={() => setShowPasswordEdit(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showOldPw ? "text" : "password"}
                      placeholder="••••••••" 
                      className="input-base pr-10" 
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowOldPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showOldPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPw ? "text" : "password"}
                      placeholder="••••••••" 
                      className="input-base pr-10" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPw ? "text" : "password"}
                      placeholder="••••••••" 
                      className="input-base pr-10" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setShowPasswordEdit(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
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

        {/* 2FA Setup Modal */}
        {show2FASetup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm cursor-pointer" onClick={() => setShow2FASetup(false)}></div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up relative z-10">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Shield size={20} className="text-primary-600" />
                  Enable Two-Factor Authentication
                </h3>
                <button onClick={() => setShow2FASetup(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">1. Scan this QR Code with your Authenticator App</p>
                  {qrCode ? (
                    <div className="bg-white p-2 border border-slate-100 dark:border-slate-700 rounded-lg shadow-sm">
                      <QRCodeSVG value={qrCode} size={150} level="M" />
                    </div>
                  ) : (
                    <div className="h-[150px] w-[150px] flex items-center justify-center bg-slate-100 rounded-lg shadow-sm">
                        <Loader2 className="animate-spin text-primary-600" />
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono text-center">{setupData?.secret}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">2. Enter Verification Code</label>
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
                      className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : "Verify"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
