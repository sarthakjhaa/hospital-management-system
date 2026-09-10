'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import { Pill, ArrowLeft, Download, Printer, RefreshCw, AlertCircle, Package, CheckCircle2 } from 'lucide-react';
import { exportToCSV, triggerPrint } from '@/lib/export';

export default function AdminPharmacyReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  const fetchPharmacyReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?type=pharmacy&dateRange=${dateRange}`);
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
    fetchPharmacyReport();
  }, [dateRange]);

  const summary = data?.summary || {};
  const medicines = data?.medicines || [];
  const orders = data?.orders || [];

  const handleExportCSV = () => {
    if (!medicines.length) return;
    const rows = medicines.map((m: any) => ({
      Medicine: m.name,
      Category: m.category,
      UnitCost: m.price,
      Stock: m.stock,
      ReorderLevel: m.minStock,
      ExpiryDate: new Date(m.expiryDate).toLocaleDateString(),
    }));
    exportToCSV('Pharmacy_Inventory_Report', rows);
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
              <Pill className="h-6 w-6 text-purple-400" /> Pharmacy Inventory & Order Fulfillment Report
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
                  ? 'bg-purple-600 text-white shadow-md'
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
            <span className="text-slate-400 text-xs font-semibold">Total Catalog Medicines</span>
            <p className="text-2xl font-black text-white font-mono">{summary.totalMedicines || 0}</p>
          </div>
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Total Stock Units</span>
            <p className="text-2xl font-black text-purple-400 font-mono">{summary.totalStockUnits || 0}</p>
          </div>
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Low-Stock Alerts</span>
            <p className="text-2xl font-black text-rose-400 font-mono">{summary.lowStockCount || 0}</p>
          </div>
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <span className="text-slate-400 text-xs font-semibold">Total Medicine Orders</span>
            <p className="text-2xl font-black text-indigo-400 font-mono">{summary.totalOrders || 0}</p>
          </div>
        </div>

        {/* Inventory Summary Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Medicine Stock Summary</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-3">Medicine Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Current Stock</th>
                    <th className="py-3 px-3">Min Level</th>
                    <th className="py-3 px-3">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {medicines.map((m: any) => {
                    const isLow = m.stock <= m.minStock;
                    return (
                      <tr key={m.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-bold text-white">{m.name}</td>
                        <td className="py-3 px-3 text-slate-300">{m.category}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">${m.price.toFixed(2)}</td>
                        <td className={`py-3 px-3 font-mono font-black ${isLow ? 'text-rose-400' : 'text-purple-400'}`}>
                          {m.stock} units
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono">{m.minStock}</td>
                        <td className="py-3 px-3 text-slate-400 font-mono">
                          {new Date(m.expiryDate).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
