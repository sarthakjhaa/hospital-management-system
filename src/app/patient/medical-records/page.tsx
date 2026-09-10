'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  FileText,
  Search,
  RefreshCw,
  Stethoscope,
  Building2,
  Calendar,
  Pill,
  Activity,
  Eye,
} from 'lucide-react';
import { formatDoctorName } from '@/lib/doctorUtils';

export default function PatientMedicalRecordsPage() {
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
      r.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      r.doctor?.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.doctor?.department?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.treatment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" /> Medical Records
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              View your previous consultations, test reports and treatment details.
            </p>
          </div>
          <button
            onClick={fetchRecords}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Records
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medical records..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Medical Records List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((rec) => (
              <div
                key={rec.id}
                className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      Diagnosis: {rec.diagnosis}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold rounded-xl flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-blue-600" />{' '}
                      {formatDoctorName(rec.doctor?.user?.name)}
                    </span>
                    <Link
                      href={`/patient/medical-records/${rec.id}`}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Department</span>
                    <span className="text-slate-900 font-bold text-xs block">
                      {rec.doctor?.department?.name || 'General Medicine'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Attending Doctor</span>
                    <span className="text-slate-900 font-bold text-xs block">
                      {formatDoctorName(rec.doctor?.user?.name)} ({rec.doctor?.specialty})
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <span className="text-slate-600 font-bold block">Treatment & Management Plan</span>
                  <p className="text-slate-700 leading-relaxed">{rec.treatment}</p>
                </div>

                {rec.labResults && (
                  <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl text-xs space-y-1">
                    <span className="text-blue-800 font-bold block flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-blue-600" /> Laboratory Diagnostics
                    </span>
                    <p className="text-slate-700">{rec.labResults}</p>
                  </div>
                )}

                {/* Prescriptions summary */}
                {rec.prescriptions?.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                      <Pill className="h-4 w-4 text-blue-600" /> Prescribed Medications ({rec.prescriptions[0].items?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {rec.prescriptions[0].items?.map((item: any) => (
                        <span
                          key={item.id}
                          className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                        >
                          <strong>{item.medicine?.name}</strong> – {item.dosage} (Qty: {item.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs space-y-2 max-w-md mx-auto my-6 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="p-3 bg-slate-100 text-slate-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-slate-200">
              <FileText className="h-6 w-6 text-slate-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Your medical records will appear here</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              After your consultation, reports and treatment details can be viewed from this section.
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
