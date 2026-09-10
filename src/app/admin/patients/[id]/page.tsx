'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { User, Calendar, FileText, Pill, CreditCard, ArrowLeft, ShieldCheck } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function AdminPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'appointments' | 'records' | 'bills' | 'orders'>('info');

  useEffect(() => {
    async function fetchPatient() {
      setLoading(true);
      try {
        const res = await fetch(`/api/patients/${id}`);
        const data = await res.json();
        setPatient(data.patient);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (!patient) {
    return (
      <DashboardShell>
        <div className="text-center py-12 space-y-4">
          <p className="text-slate-400 text-sm">Patient profile not found.</p>
          <Link href="/admin/patients" className="text-cyan-400 font-bold text-xs underline">
            Return to Patients Directory
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <Link
          href="/admin/patients"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Patients Directory
        </Link>

        {/* Patient Profile Header */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
              <User className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white">{patient.user?.name}</h1>
                <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold rounded-md">
                  {patient.patientIdCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Age: {patient.age} yrs • Gender: {patient.gender} • Blood Group: <strong className="text-rose-400">{patient.bloodGroup || 'O+'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="flex border-b border-slate-800 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 transition-all border-b-2 ${
              activeTab === 'info' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 transition-all border-b-2 ${
              activeTab === 'appointments' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Appointments ({patient.appointments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-3 transition-all border-b-2 ${
              activeTab === 'records' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            EHR & Prescriptions ({patient.medicalRecords?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`pb-3 transition-all border-b-2 ${
              activeTab === 'bills' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Bills & Payments ({patient.bills?.length || 0})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'info' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <h4 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wider text-slate-400">Contact Details</h4>
              <p className="text-slate-300"><strong>Email:</strong> {patient.user?.email}</p>
              <p className="text-slate-300 mt-1"><strong>Phone:</strong> {patient.user?.phone}</p>
              <p className="text-slate-300 mt-1"><strong>Address:</strong> {patient.address}</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wider text-slate-400">Emergency & Medical</h4>
              <p className="text-slate-300"><strong>Emergency Contact:</strong> {patient.emergencyContact}</p>
              <p className="text-slate-300 mt-1"><strong>Ward Bed Allocation:</strong> {patient.wardNumber || 'None'}</p>
              <p className="text-slate-300 mt-1"><strong>Medical History:</strong> {patient.medicalHistory || 'No prior notes recorded'}</p>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            {patient.appointments?.map((apt: any) => (
              <div key={apt.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-bold text-cyan-400">{apt.appointmentNo}</span>
                  <p className="font-bold text-white mt-1">Doctor: {apt.doctor?.user?.name}</p>
                  <p className="text-slate-400">Date: {new Date(apt.date).toLocaleDateString()} at {apt.timeSlot}</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 font-bold rounded-lg uppercase">{apt.status}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'records' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            {patient.medicalRecords?.map((rec: any) => (
              <div key={rec.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2">
                <h4 className="font-bold text-white">Diagnosis: {rec.diagnosis}</h4>
                <p className="text-slate-300"><strong>Treatment:</strong> {rec.treatment}</p>
                {rec.labResults && <p className="text-slate-400"><strong>Lab Results:</strong> {rec.labResults}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bills' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            {patient.bills?.map((bill: any) => (
              <div key={bill.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-200">{bill.billNo}</span>
                  <p className="text-slate-400">Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 text-sm">${bill.grandTotal.toFixed(2)}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{bill.paymentStatus}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
