"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Shield, Activity, HardDrive, Server, Loader2 } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const systemLoadData = [
  { time: "00:00", load: 24 },
  { time: "04:00", load: 18 },
  { time: "08:00", load: 45 },
  { time: "12:00", load: 82 },
  { time: "16:00", load: 75 },
  { time: "20:00", load: 52 },
];

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">System Analytics</h1>
            <p className="text-sm text-slate-500">Infrastructure and platform health monitoring</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold ring-1 ring-emerald-200">
            <Activity className="h-3 w-3" /> System Live
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">API Health</p>
                <h3 className="text-2xl font-bold text-slate-900">99.9%</h3>
              </div>
            </div>
          </div>
          <div className="card-premium p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                <HardDrive className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Storage Usage</p>
                <h3 className="text-2xl font-bold text-slate-900">14.2 GB</h3>
              </div>
            </div>
          </div>
          <div className="card-premium p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active Sessions</p>
                <h3 className="text-2xl font-bold text-slate-900">248</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 underline-premium">API Requests Load (24h)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={systemLoadData}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b" }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="load" 
                  stroke="#0ea5e9" 
                  fillOpacity={1} 
                  fill="url(#colorLoad)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
