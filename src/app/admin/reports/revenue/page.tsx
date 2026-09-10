'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import { DollarSign, ArrowLeft, Download, Printer, RefreshCw, CheckCircle2, AlertCircle, FileText, Pill } from 'lucide-react';
import { exportToCSV, triggerPrint } from '@/lib/export';

export default function AdminRevenueReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  const fetchRevenueReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?type=revenue&dateRange=${dateRange}`);
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
    fetchRevenueReport();
  }, [dateRange]);

  const summary = data?.summary || {};
  const payments = data?.payments || [];

  const handleExportCSV = () => {
    if (!payments.length) return;
    const rows = payments.map((p: any) => ({
      'Transaction ID': p.transactionId,
      'Invoice #': p.bill?.billNo || '',
      Patient: p.bill?.patient?.user?.name || '',
      Method: p.method,
      Amount: p.amount,
      Status: p.status,
      Date: new Date(p.createdAt).toLocaleString(),
    }));
    exportToCSV('Financial_Revenue_Report', rows);
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
              <DollarSign className="h-6 w-6 text-emerald-400" /> Revenue & Financial Settlement Report
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
                  ? 'bg-emerald-600 text-white shadow-md'
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
            <span className="text-slate-400 text-xs font-semibold">Total Settled Revenue</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              ${(summary.totalRevenue || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Consultation Revenue</span>
            <p className="text-2xl font-black text-blue-400 font-mono">
              ${(summary.consultationRevenue || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Pharmacy Revenue</span>
            <p className="text-2xl font-black text-purple-400 font-mono">
              ${(summary.pharmacyRevenue || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Successful Transactions</span>
            <p className="text-2xl font-black text-white font-mono">{summary.successfulTransactions || 0}</p>
          </div>
        </div>

        {/* Revenue Source Visual Breakdown Bars */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Revenue Stream Share</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-bold mb-1">
                <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-blue-400" /> Doctor Consultations</span>
                <span className="font-mono">${(summary.consultationRevenue || 0).toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${summary.totalRevenue ? (summary.consultationRevenue / summary.totalRevenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-bold mb-1">
                <span className="flex items-center gap-1.5"><Pill className="h-3.5 w-3.5 text-purple-400" /> Pharmacy Medicine Sales</span>
                <span className="font-mono">${(summary.pharmacyRevenue || 0).toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${summary.totalRevenue ? (summary.pharmacyRevenue / summary.totalRevenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Settled Payment Transactions</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-3">Transaction ID</th>
                    <th className="py-3 px-3">Invoice #</th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-white">{p.transactionId}</td>
                      <td className="py-3 px-3 font-mono text-slate-300">{p.bill?.billNo}</td>
                      <td className="py-3 px-3 text-slate-300">{p.bill?.patient?.user?.name}</td>
                      <td className="py-3 px-3 font-bold text-cyan-400">{p.method}</td>
                      <td className="py-3 px-3 font-mono font-black text-emerald-400">${p.amount.toFixed(2)}</td>
                      <td className="py-3 px-3 text-slate-400 font-mono">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            p.status === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {p.status}
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
