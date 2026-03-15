"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { clsx } from "clsx";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
