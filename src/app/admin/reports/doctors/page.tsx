'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import { Stethoscope, ArrowLeft, Download, Printer, RefreshCw, Building2, Calendar } from 'lucide-react';
import { exportToCSV, triggerPrint } from '@/lib/export';

export default function AdminDoctorReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  const fetchDoctorReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?type=doctors&dateRange=${dateRange}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorReport();
  }, [dateRange]);

  const summary = data?.summary || {};
  const doctors = data?.doctors || [];
  const deptDistribution = data?.deptDistribution || [];

  const handleExportCSV = () => {
    if (!doctors.length) return;
    const rows = doctors.map((d: any) => ({
      'Doctor Name': d.name,
      Specialty: d.specialty,
      Department: d.department,
      ConsultationFee: d.consultationFee,
      TotalAppointments: d.totalAppointments,
      CompletedAppointments: d.completedAppointments,
      CancelledAppointments: d.cancelledAppointments,
    }));
    exportToCSV('Doctor_Performance_Report', rows);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Analytics Overview
            </Link>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Stethoscope className="h-6 w-6 text-blue-400" /> Doctor Clinical Activity & Specialty Report
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="h-4 w-4 text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={triggerPrint}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4 text-blue-400" /> Print
            </button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Filter Period:</span>
          {['all', 'today', 'this_week', 'this_month', 'last_month'].map((period) => (
            <button
              key={period}
              onClick={() => setDateRange(period)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition-all ${
                dateRange === period
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {period.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Department Distribution Progress Overview */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-400" /> Doctors Distribution by Department
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {deptDistribution.map((d: any) => (
              <div key={d.id} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-white">{d.name}</span>
                <p className="text-lg font-black text-blue-400 font-mono">{d.doctorCount} Doctor(s)</p>
              </div>
            ))}
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Doctor Clinical Statistics</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-3">Doctor Name</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Specialty</th>
                    <th className="py-3 px-3">Consult Fee</th>
                    <th className="py-3 px-3 text-center">Total Appointments</th>
                    <th className="py-3 px-3 text-center">Completed</th>
                    <th className="py-3 px-3 text-center">Cancelled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {doctors.map((d: any) => (
                    <tr key={d.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-white">Dr. {d.name}</td>
                      <td className="py-3 px-3 text-slate-300">{d.department}</td>
                      <td className="py-3 px-3 text-blue-400 font-semibold">{d.specialty}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">${d.consultationFee}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">{d.totalAppointments}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">{d.completedAppointments}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-rose-400">{d.cancelledAppointments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
