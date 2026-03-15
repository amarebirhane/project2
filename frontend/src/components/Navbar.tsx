"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon, Bell, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notificationService, Notification } from "@/services/notificationService";
import { useToasts } from "@/components/Toast";
import { clsx } from "clsx";

interface NavbarProps {
  isSidebarOpen: boolean;
}

export default function Navbar({ isSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { addToast } = useToasts();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
      setShowNotifications(false);
    }
  };

  const markAllRead = async () => {
    try {
      const updated = await notificationService.markAllAsRead();
      setNotifications(updated);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const updatedItem = await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === updatedItem.id ? updatedItem : n));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) return null;

  return (
    <nav className={clsx(
      "fixed top-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all duration-300",
      isSidebarOpen ? "md:w-[calc(100%-16rem)]" : "md:w-[calc(100%-5rem)]",
      "w-full" // mobile full width
    )}>
      <div className="px-4 h-16 flex items-center">
        <div className="flex items-center justify-between w-full gap-4">
          
          {/* Left Side: Welcome or Mobile Drawer Toggle (if needed) */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <h1 className="text-lg font-bold text-slate-800 hidden lg:block whitespace-nowrap overflow-hidden text-ellipsis">
              Welcome back, <span className="text-primary-600">{user.username}</span>
            </h1>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xl hidden sm:block px-4">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search everywhere..." 
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all text-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowDropdown(false);
                }}
                className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all relative group"
              >
                <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 animate-fade-in z-50">
                  <div className="flex justify-between items-center px-4 pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          onClick={() => !notification.is_read && markAsRead(notification.id)}
                          className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 ${notification.is_read ? 'opacity-60' : ''}`}
                        >
                          <p className={`text-sm ${notification.is_read ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-slate-500">No new notifications</div>
                    )}
                  </div>
                  <div className="px-4 pt-2 border-t border-slate-100">
                    <Link href="/settings" className="text-xs text-center block text-slate-500 hover:text-primary-600">
                      Notification Settings
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-slate-200 text-slate-500 border border-slate-300">
                  {user.profile_image_url ? (
                    <img src={user.profile_image_url} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="hidden sm:block text-left pr-2">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{user.username}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</p>
                </div>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 animate-fade-in z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Settings & Security
                  </Link>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => {
                      logout();
                      addToast("Signed out successfully", "info");
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
