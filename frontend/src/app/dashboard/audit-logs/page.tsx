"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { auditService, AuditLog } from "@/services/auditService";
import Pagination from "@/components/Pagination";
import { Shield, User, Clock, Activity, Search, Filter } from "lucide-react";
import { TableSkeleton } from "@/components/Skeletons";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    pages: 0,
    size: 8
  });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async (targetPage = page) => {
    setLoading(true);
    try {
      const data = await auditService.getLogs(targetPage, 8);
      setLogs(data.items);
      setPaginationInfo({
        total: data.total,
        pages: data.pages,
        size: data.size
      });
      setPage(data.page);
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchLogs(newPage);
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.target_type && log.target_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActionColor = (action: string) => {
    if (action.includes("failed") || action.includes("denied")) return "text-red-600 bg-red-50";
    if (action.includes("create") || action.includes("register")) return "text-emerald-600 bg-emerald-50";
    if (action.includes("update") || action.includes("edit")) return "text-amber-600 bg-amber-50";
    if (action.includes("delete")) return "text-rose-600 bg-rose-50";
    return "text-blue-600 bg-blue-50";
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-premium">System Audit Logs</h1>
          <p className="text-sm text-slate-500">Track all security-relevant events and user actions</p>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by action, user, or target..." 
              className="input-base pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Filter size={18} /> Filters
          </button>
        </div>

        {loading ? (
          <TableSkeleton rows={8} />
        ) : (
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Timestamp</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Target</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            <User size={12} />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{log.username || "System"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {log.target_type ? (
                          <span className="capitalize">{log.target_type}: {log.target_id || "N/A"}</span>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                        {log.ip_address || "Internal"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Pagination
              currentPage={page}
              totalPages={paginationInfo.pages}
              onPageChange={handlePageChange}
              pageSize={paginationInfo.size}
              totalItems={paginationInfo.total}
            />
          {filteredLogs.length === 0 && (
              <div className="p-12 text-center">
                <Activity size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">No audit logs found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
