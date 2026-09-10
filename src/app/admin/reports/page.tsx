'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  BarChart3,
  Users,
  Stethoscope,
  Calendar,
  CreditCard,
  Pill,
  DollarSign,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Package,
} from 'lucide-react';
import { exportToCSV, triggerPrint } from '@/lib/export';

export default function AdminReportsMainPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  const fetchReportsSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?type=summary&dateRange=${dateRange}`);
      if (res.ok) {
        const result = await res.json();
        setData(result.summaryCards || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsSummary();
  }, [dateRange]);

  const cards = [
    { label: 'Total Patients', value: data?.totalPatients || 0, icon: Users, color: 'text-cyan-400', href: '/admin/reports/patients' },
    { label: 'Total Doctors', value: data?.totalDoctors || 0, icon: Stethoscope, color: 'text-blue-400', href: '/admin/reports/doctors' },
    { label: 'Total Appointments', value: data?.totalAppointments || 0, icon: Calendar, color: 'text-emerald-400', href: '/admin/reports/appointments' },
    { label: 'Completed Consultations', value: data?.completedAppointments || 0, icon: CheckCircle2, color: 'text-emerald-300', href: '/admin/reports/appointments' },
    { label: 'Cancelled Appointments', value: data?.cancelledAppointments || 0, icon: AlertCircle, color: 'text-rose-400', href: '/admin/reports/appointments' },
    { label: 'Total Bills', value: data?.totalBills || 0, icon: CreditCard, color: 'text-purple-400', href: '/admin/reports/billing' },
    { label: 'Paid Bills', value: data?.paidBills || 0, icon: CheckCircle2, color: 'text-emerald-400', href: '/admin/reports/billing' },
    { label: 'Pending Bills', value: data?.pendingBills || 0, icon: AlertCircle, color: 'text-amber-400', href: '/admin/reports/billing' },
    { label: 'Total Revenue', value: `$${(data?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', href: '/admin/reports/revenue' },
    { label: 'Medicine Orders', value: data?.totalOrders || 0, icon: Package, color: 'text-indigo-400', href: '/admin/reports/pharmacy' },
    { label: 'Completed Orders', value: data?.completedOrders || 0, icon: CheckCircle2, color: 'text-indigo-300', href: '/admin/reports/pharmacy' },
    { label: 'Low Stock Medicines', value: data?.lowStockCount || 0, icon: Pill, color: 'text-rose-400', href: '/admin/reports/pharmacy' },
  ];

  const handleExportCSV = () => {
    if (!data) return;
    const exportRows = Object.keys(data).map((key) => ({
      Metric: key,
      Value: data[key],
    }));
    exportToCSV('Admin_Operational_Summary_Report', exportRows);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <BarChart3 className="h-6 w-6 text-blue-400" /> Administrative Analytics & Operational Reports
            </h1>
            <p className="text-xs text-slate-400">Database-backed executive telemetry, financial statistics & metrics</p>
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
              <Printer className="h-4 w-4 text-blue-400" /> Print Report
            </button>
            <button
              onClick={fetchReportsSummary}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="h-4 w-4 text-slate-400" /> Refresh
            </button>
          </div>
        </div>

        {/* Date Filter Selector */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Filter Period:</span>
          {['all', 'today', 'yesterday', 'this_week', 'this_month', 'last_month'].map((period) => (
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

        {/* Report Sub-Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/reports/patients"
            className="p-3 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl text-center space-y-1 transition-all"
          >
            <Users className="h-5 w-5 text-cyan-400 mx-auto" />
            <span className="text-xs font-bold text-slate-200 block">Patients</span>
          </Link>
          <Link
            href="/admin/reports/doctors"
            className="p-3 bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl text-center space-y-1 transition-all"
          >
            <Stethoscope className="h-5 w-5 text-blue-400 mx-auto" />
            <span className="text-xs font-bold text-slate-200 block">Doctors</span>
          </Link>
          <Link
            href="/admin/reports/appointments"
            className="p-3 bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-center space-y-1 transition-all"
          >
            <Calendar className="h-5 w-5 text-emerald-400 mx-auto" />
            <span className="text-xs font-bold text-slate-200 block">Appointments</span>
          </Link>
          <Link
            href="/admin/reports/revenue"
            className="p-3 bg-slate-900/90 border border-slate-800 hover:border-emerald-400/50 rounded-2xl text-center space-y-1 transition-all"
          >
            <DollarSign className="h-5 w-5 text-emerald-400 mx-auto" />
            <span className="text-xs font-bold text-slate-200 block">Revenue</span>
          </Link>
          <Link
            href="/admin/reports/pharmacy"
            className="p-3 bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-2xl text-center space-y-1 transition-all"
          >
            <Pill className="h-5 w-5 text-purple-400 mx-auto" />
            <span className="text-xs font-bold text-slate-200 block">Pharmacy</span>
          </Link>
          <Link
            href="/admin/reports/billing"
            className="p-3 bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-center space-y-1 transition-all"
          >
            <CreditCard className="h-5 w-5 text-indigo-400 mx-auto" />
            <span className="text-xs font-bold text-slate-200 block">Billing</span>
          </Link>
        </div>

        {/* 12 Database Summary Cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.label}
                  href={c.href}
                  className="p-5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl shadow-lg space-y-2 group transition-all"
                >
                  <div className="flex justify-between items-center text-slate-400 text-xs">
                    <span className="font-semibold">{c.label}</span>
                    <Icon className={`h-4 w-4 ${c.color}`} />
                  </div>
                  <p className={`text-2xl font-black ${c.color} font-mono`}>{c.value}</p>
                  <span className="text-[10px] text-slate-500 group-hover:text-blue-400 transition-colors block">
                    Click for detailed breakdown &rarr;
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
