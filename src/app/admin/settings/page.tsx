'use client';

import { useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Settings, Save, CheckCircle2, Shield, Lock } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    hospitalName: 'Central General Hospital & Medical Center',
    academicContext: 'B.Tech CSE 5th Semester Lab Project',
    emergencyPhone: '+1 (800) 555-0199',
    autoApproveAppointments: false,
    sessionTimeoutMins: '120',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-slate-400" /> Hospital Portal Settings
          </h1>
          <p className="text-xs text-slate-400">Configure global application parameters & system policies</p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Hospital system settings updated successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Hospital Institution Name</label>
            <input
              type="text"
              value={form.hospitalName}
              onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Academic Context & Laboratory Tag</label>
            <input
              type="text"
              value={form.academicContext}
              onChange={(e) => setForm({ ...form, academicContext: e.target.value })}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Emergency Desk Contact Number</label>
            <input
              type="text"
              value={form.emergencyPhone}
              onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
            />
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
            <input
              type="checkbox"
              id="autoApprove"
              checked={form.autoApproveAppointments}
              onChange={(e) => setForm({ ...form, autoApproveAppointments: e.target.checked })}
              className="rounded border-slate-700 bg-slate-950 text-blue-600"
            />
            <label htmlFor="autoApprove" className="text-slate-300 font-medium">
              Automatically confirm appointment bookings upon submission
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Save className="h-4 w-4" /> Save System Settings
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
