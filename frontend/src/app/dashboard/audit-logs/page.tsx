"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { auditService, AuditLog } from "@/services/auditService";
import Pagination from "@/components/Pagination";
import { Shield, User, Clock, Activity, Search, Filter, DownloadCloud, Eye, X } from "lucide-react";
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
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-premium">System Audit Logs</h1>
            <p className="text-sm text-slate-500">Track all security-relevant events and user actions</p>
          </div>
          <button 
            onClick={() => auditService.exportLogsPDF()}
            className="btn-primary-outline flex items-center gap-2"
          >
            <DownloadCloud size={18} /> Export PDF
          </button>
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
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Details</th>
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
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          title="View Details"
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all shadow-sm"
                        >
                          <Eye size={16} />
                        </button>
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

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedLog(null)} />
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up relative z-10">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Shield size={18} className="text-primary-600" />
                  Audit Log Details
                </h3>
                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Action badge */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timestamp</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{new Date(selectedLog.created_at).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actor</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{selectedLog.username || "System"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Type</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">{selectedLog.target_type || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target ID</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100 font-mono text-xs break-all">{selectedLog.target_id || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">IP Address</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100 font-mono">{selectedLog.ip_address || "Internal"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Log ID</p>
                    <p className="font-medium text-slate-400 font-mono text-xs break-all">{selectedLog.id}</p>
                  </div>
                </div>

                {/* Details / metadata block if present */}
                {(selectedLog as any).details && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Additional Details</p>
                    <pre className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-300 overflow-auto max-h-40 font-mono">
                      {typeof (selectedLog as any).details === "string"
                        ? (selectedLog as any).details
                        : JSON.stringify((selectedLog as any).details, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

