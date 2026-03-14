"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex flex-col md:ml-64 transition-all duration-300">
          <Navbar />
          <main className="flex-1 p-4 lg:p-8 mt-16 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
