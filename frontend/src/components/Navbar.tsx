"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon, Bell } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = React.useState(false);

  if (!user) return null;

  return (
    <nav className="fixed top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 ml-0 md:ml-64 w-[calc(100%-16rem)]">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
              Welcome back, <span className="text-primary-600">{user.username}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-all"
              >
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div className="hidden sm:block text-left">
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
                  href="/settings/password"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Security Settings
                </Link>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={logout}
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
