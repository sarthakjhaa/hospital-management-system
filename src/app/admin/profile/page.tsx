'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { User, Mail, Shield, CheckCircle2 } from 'lucide-react';

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <User className="h-6 w-6 text-rose-500" /> Administrator Account Profile
          </h1>
          <p className="text-xs text-slate-400">Manage administrator profile metadata and active session credentials</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
              <div className="p-4 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">{user?.name || 'Administrator'}</h3>
                <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 font-extrabold rounded text-[10px] uppercase border border-rose-500/30">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <span className="text-slate-500 font-semibold block">Email Address</span>
                <p className="text-white font-mono font-bold text-sm">{user?.email}</p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block">Account Identifier</span>
                <p className="text-slate-300 font-mono">{user?.id}</p>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Active Authenticated Session (Role Access Granted)
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
