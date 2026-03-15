"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { clsx } from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToasts } from "@/components/Toast";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { addToast } = useToasts();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize Real-time Notifications
  useWebSocket(user?.id, {
    onMessage: (data) => {
      // Show professional toast for any incoming notification
      addToast(
        data.message || "Something happened!",
        data.type || "info",
        data.title || "Real-time Update"
      );
    },
    onConnect: () => console.log("Real-time system active."),
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={clsx(
          "flex flex-col transition-all duration-300",
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        )}>
          <Navbar isSidebarOpen={isSidebarOpen} />
          <main className="flex-1 p-4 lg:p-8 mt-16 animate-fade-in text-slate-900">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
