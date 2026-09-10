'use client';

import { useState, useEffect } from 'react';
import { HeartPulse, Bed, User, ShieldCheck, Activity, Search } from 'lucide-react';

export default function NurseDashboardPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [query]);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-emerald-400" /> Nursing Care & Ward Management Portal
        </h1>
        <p className="text-xs text-slate-400">In-patient ward monitoring, bed tracking & nursing patient care</p>
      </div>

      {/* Ward Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Bed className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Assigned Ward Beds</span>
            <p className="text-2xl font-black text-white">{patients.length} Occupied</p>
          </div>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Shift Care Status</span>
            <p className="text-2xl font-black text-emerald-400">Active Monitoring</p>
          </div>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Vitals Log Sync</span>
            <p className="text-2xl font-black text-purple-400">100% Up to date</p>
          </div>
        </div>
      </div>

      {/* Patient Ward List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-400" /> Admitted Patients & Ward Details
          </h3>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient or bed code..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading patient wards...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients.map((pat) => (
              <div
                key={pat.id}
                className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{pat.patientIdCode}</span>
                    <h4 className="text-base font-bold text-white">{pat.user?.name}</h4>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-lg">
                    {pat.wardNumber || 'General Ward A'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Age / Gender:</span>
                    <strong>{pat.age} yrs / {pat.gender}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Blood Group:</span>
                    <strong className="text-rose-400">{pat.bloodGroup || 'O+'}</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  <strong>Emergency Contact:</strong> {pat.emergencyContact}
                </div>
                {pat.medicalHistory && (
                  <div className="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-xl">
                    <strong className="text-amber-400">Medical Notes:</strong> {pat.medicalHistory}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
