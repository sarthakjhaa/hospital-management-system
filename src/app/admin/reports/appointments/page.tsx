'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import { Calendar, ArrowLeft, Download, Printer, RefreshCw, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { exportToCSV, triggerPrint } from '@/lib/export';

export default function AdminAppointmentReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchAppointmentReport = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/reports?type=appointments&dateRange=${dateRange}`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
      const res = await fetch(url);
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
    fetchAppointmentReport();
  }, [dateRange, statusFilter]);

  const counts = data?.counts || {};
  const appointments = data?.appointments || [];

  const handleExportCSV = () => {
    if (!appointments.length) return;
    const rows = appointments.map((a: any) => ({
      'Appointment #': a.appointmentNo,
      Patient: a.patient?.user?.name || '',
      Doctor: `Dr. ${a.doctor?.user?.name || ''}`,
      Department: a.doctor?.department?.name || '',
      Date: new Date(a.date).toLocaleDateString(),
      TimeSlot: a.timeSlot,
      Status: a.status,
    }));
    exportToCSV('Appointment_Analytics_Report', rows);
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
              <Calendar className="h-6 w-6 text-emerald-400" /> Appointment Utilization & Scheduling Report
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

        {/* Date & Status Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Filter Period:</span>
            {['all', 'today', 'this_week', 'this_month', 'last_month'].map((period) => (
              <button
                key={period}
                onClick={() => setDateRange(period)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition-all ${
                  dateRange === period
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {period.replace('_', ' ')}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Total Appointments</span>
            <p className="text-2xl font-black text-white font-mono">{counts.total || 0}</p>
          </div>
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Completed Consultations</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">{counts.completed || 0}</p>
          </div>
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Confirmed Bookings</span>
            <p className="text-2xl font-black text-blue-400 font-mono">{counts.confirmed || 0}</p>
          </div>
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Cancelled</span>
            <p className="text-2xl font-black text-rose-400 font-mono">{counts.cancelled || 0}</p>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Appointment Records</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-3">Appointment #</th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Doctor</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {appointments.map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-white">{a.appointmentNo}</td>
                      <td className="py-3 px-3 text-slate-200">{a.patient?.user?.name}</td>
                      <td className="py-3 px-3 text-cyan-400 font-semibold">Dr. {a.doctor?.user?.name}</td>
                      <td className="py-3 px-3 text-slate-400">{a.doctor?.department?.name || 'General'}</td>
                      <td className="py-3 px-3 text-slate-300 font-mono">
                        {new Date(a.date).toLocaleDateString()} @ {a.timeSlot}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            a.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : a.status === 'CONFIRMED'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
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
