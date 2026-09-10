'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Shield, Search, RefreshCw, UserCheck } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?role=${roleFilter}&query=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const ROLE_BADGES: Record<string, string> = {
    ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    DOCTOR: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    NURSE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    RECEPTIONIST: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    PHARMACIST: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    PATIENT: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Shield className="h-6 w-6 text-rose-500" /> User Accounts & Role Oversight
            </h1>
            <p className="text-xs text-slate-400">View and audit all registered system accounts across 6 RBAC roles</p>
          </div>
          <button
            onClick={fetchUsers}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user accounts by name, email or phone..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">All 6 System Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="DOCTOR">DOCTOR</option>
            <option value="NURSE">NURSE</option>
            <option value="RECEPTIONIST">RECEPTIONIST</option>
            <option value="PHARMACIST">PHARMACIST</option>
            <option value="PATIENT">PATIENT</option>
          </select>
        </form>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Phone</th>
                    <th className="py-3 px-2">Assigned Role</th>
                    <th className="py-3 px-2">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-2 font-bold text-white flex items-center gap-2">
                          <UserCheck className="h-3.5 w-3.5 text-slate-400" /> {u.name}
                        </td>
                        <td className="py-3 px-2 text-slate-300">{u.email}</td>
                        <td className="py-3 px-2 text-slate-400 font-mono">{u.phone || 'N/A'}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                              ROLE_BADGES[u.role]
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-400 font-mono">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No user accounts match criteria.
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
