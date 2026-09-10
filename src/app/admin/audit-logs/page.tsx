'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { History, Search, RefreshCw, ShieldAlert } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.auditLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <History className="h-6 w-6 text-amber-400" /> Security Audit Logs & System Trail
            </h1>
            <p className="text-xs text-slate-400">Immutable audit log of administrative actions and security events</p>
          </div>
          <button
            onClick={fetchAuditLogs}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Logs
          </button>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-2">Timestamp</th>
                    <th className="py-3 px-2">User / Actor</th>
                    <th className="py-3 px-2">Action</th>
                    <th className="py-3 px-2">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-2 text-slate-400 font-mono">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 font-bold text-white">
                          {log.user?.name || 'System Auto'} ({log.user?.role || 'SYSTEM'})
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-amber-400">{log.action}</td>
                        <td className="py-3 px-2 text-slate-300">{log.details}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No audit log entries recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
