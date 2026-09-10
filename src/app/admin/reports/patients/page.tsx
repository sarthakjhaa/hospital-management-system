'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import { Users, ArrowLeft, Download, Printer, RefreshCw, UserCheck, Calendar } from 'lucide-react';
import { exportToCSV, triggerPrint } from '@/lib/export';

export default function AdminPatientReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  const fetchPatientReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?type=patients&dateRange=${dateRange}`);
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
    fetchPatientReport();
  }, [dateRange]);

  const summary = data?.summary || {};
  const patients = data?.patients || [];

  const handleExportCSV = () => {
    if (!patients.length) return;
    const rows = patients.map((p: any) => ({
      'Patient Name': p.user?.name || '',
      Email: p.user?.email || '',
      Phone: p.user?.phone || '',
      Gender: p.gender || 'N/A',
      BloodGroup: p.bloodGroup || 'N/A',
      RegisteredDate: new Date(p.user?.createdAt).toLocaleDateString(),
    }));
    exportToCSV('Patient_Demographics_Report', rows);
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
              <Users className="h-6 w-6 text-cyan-400" /> Patient Demographics & Registration Report
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
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {period.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Total Patients</span>
            <p className="text-2xl font-black text-white font-mono">{summary.totalPatients || 0}</p>
          </div>
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Active Patients</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">{summary.activePatients || 0}</p>
          </div>
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">New Registrations</span>
            <p className="text-2xl font-black text-cyan-400 font-mono">{summary.newRegistrations || 0}</p>
          </div>
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Gender Balance (M / F / O)</span>
            <p className="text-lg font-black text-blue-400 font-mono">
              {summary.genderDistribution?.MALE || 0} / {summary.genderDistribution?.FEMALE || 0} / {summary.genderDistribution?.OTHER || 0}
            </p>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Patient Records List</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-3">Patient Name</th>
                    <th className="py-3 px-3">Contact Email</th>
                    <th className="py-3 px-3">Gender</th>
                    <th className="py-3 px-3">Blood Group</th>
                    <th className="py-3 px-3">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {patients.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-white">{p.user?.name}</td>
                      <td className="py-3 px-3 text-slate-300">{p.user?.email}</td>
                      <td className="py-3 px-3 text-cyan-400 font-semibold">{p.gender || 'N/A'}</td>
                      <td className="py-3 px-3 font-mono text-emerald-400">{p.bloodGroup || 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-400 font-mono">
                        {new Date(p.user?.createdAt).toLocaleDateString()}
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
