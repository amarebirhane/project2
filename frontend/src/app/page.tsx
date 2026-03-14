"use client";

import Link from "next/link";
import { CheckSquare, ArrowRight, Shield, Zap, Layout } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <CheckSquare className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">TaskMind</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Log in
          </Link>
          <Link href="/register" className="btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
          <Zap className="h-3 w-3" /> Now with AI-Powered Productivity
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight animate-slide-up">
          Manage smarter. <br />
          <span className="text-primary-600">Work faster.</span>
        </h1>
        
        <p className="text-xl text-slate-500 mb-10 max-w-2xl animate-slide-up delay-100">
          The all-in-one productivity suite for high-performance teams. 
          Role-based task management, interactive analytics, and seamless collaboration.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-200">
          <Link href="/register" className="btn-primary px-8 py-4 text-lg flex items-center gap-3 group">
            Start Your Journey <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 text-lg font-bold text-slate-700 hover:bg-white rounded-xl transition-all border border-slate-200 hover:shadow-sm">
            Watch Video
          </button>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left animate-slide-up delay-300">
          {[
            { title: "Team RBAC", desc: "Granular control for Admins, Managers, and Users.", icon: Shield },
            { title: "Smart Analytics", desc: "Interactive charts to track your team's velocity.", icon: Zap },
            { title: "Premium UI", desc: "Dark mode ready, responsive, and blazing fast.", icon: Layout },
          ].map((feature, i) => (
            <div key={i} className="card-premium p-6">
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="p-8 text-center text-slate-400 text-sm">
        &copy; 2024 TaskMind. Built for high-performance teams.
      </footer>
    </div>
  );
}
