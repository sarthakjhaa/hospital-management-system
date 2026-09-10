'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  FileText,
  Stethoscope,
  Building2,
  Calendar,
  ArrowLeft,
  Pill,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { formatDoctorName } from '@/lib/doctorUtils';

export default function PatientMedicalRecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecord() {
      setLoading(true);
      try {
        const res = await fetch('/api/medical-records');
        if (res.ok) {
          const data = await res.json();
          const found = (data.records || []).find((r: any) => r.id === id);
          if (found) {
            setRecord(found);
          } else {
            setError('Medical record not found or access denied');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load record');
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [id]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (error || !record) {
    return (
      <DashboardShell>
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-4 max-w-md mx-auto my-10 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]">
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Access Error</h3>
          <p className="text-xs text-rose-600 font-semibold">{error || 'Record not found'}</p>
          <button
            onClick={() => router.push('/patient/medical-records')}
            className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors"
          >
            Back to Medical Records
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-3xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/patient/medical-records')}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Medical Record Details
              </h1>
              <p className="text-xs text-slate-500">Recorded on {new Date(record.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Record Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">Attending Doctor</span>
              <span className="text-slate-900 font-bold text-sm block flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-blue-600" /> {formatDoctorName(record.doctor?.user?.name)}
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">Department & Specialty</span>
              <span className="text-slate-900 font-bold text-sm block flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-blue-600" /> {record.doctor?.specialty} ({record.doctor?.department?.name})
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-slate-500 font-bold block text-[11px]">Clinical Diagnosis</span>
            <p className="text-slate-900 font-bold text-sm">{record.diagnosis}</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-slate-500 font-bold block text-[11px]">Treatment & Medical Instructions</span>
            <p className="text-slate-700 leading-relaxed">{record.treatment}</p>
          </div>

          {record.labResults && (
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1">
              <span className="text-blue-800 font-bold block flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-blue-600" /> Laboratory Diagnostics & Test Observations
              </span>
              <p className="text-slate-700">{record.labResults}</p>
            </div>
          )}

          {/* Prescriptions Section */}
          {record.prescriptions?.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Pill className="h-4 w-4 text-blue-600" /> Associated Prescriptions
              </h4>
              <div className="space-y-2">
                {record.prescriptions[0].items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900">{item.medicine?.name}</h5>
                      <p className="text-[11px] text-slate-500">Dosage: {item.dosage}</p>
                    </div>
                    <span className="font-mono text-emerald-700 font-bold">Qty: {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
