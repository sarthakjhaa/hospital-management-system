'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { FileText, Search, RefreshCw, User, Stethoscope } from 'lucide-react';

export default function AdminMedicalRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/medical-records');
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filtered = records.filter(
    (r) =>
      r.patient?.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.doctor?.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <FileText className="h-6 w-6 text-emerald-400" /> Electronic Health Records (EHR)
            </h1>
            <p className="text-xs text-slate-400">Audit patient medical histories, clinical diagnoses & treatment plans</p>
          </div>
          <button
            onClick={fetchRecords}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records by patient, doctor or diagnosis..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.length > 0 ? (
                filtered.map((rec) => (
                  <div key={rec.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </span>
                        <h4 className="font-bold text-white text-sm flex items-center gap-2 mt-0.5">
                          <User className="h-4 w-4 text-cyan-400" /> Patient: {rec.patient?.user?.name}
                        </h4>
                      </div>
                      <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                        <Stethoscope className="h-3.5 w-3.5" /> Dr. {rec.doctor?.user?.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-slate-500 font-bold block">Diagnosis</span>
                        <p className="text-slate-200">{rec.diagnosis}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Treatment Plan</span>
                        <p className="text-slate-300">{rec.treatment || 'Standard clinical observations.'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-slate-500 text-xs">No medical records match query.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
