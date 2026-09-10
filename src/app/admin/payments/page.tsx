'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  DollarSign,
  Search,
  RefreshCw,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  CreditCard,
  Eye,
  Filter,
} from 'lucide-react';
import PrintReceiptModal from '@/components/shared/PrintReceiptModal';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Selected Bill for Receipt Modal
  const [selectedBill, setSelectedBill] = useState<any>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Compute Dashboard Statistics dynamically from Database Data
  const successfulPayments = payments.filter((p) => p.status === 'SUCCESS');
  const totalRevenue = successfulPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalSuccessCount = successfulPayments.length;
  const failedPaymentsCount = payments.filter((p) => p.status === 'FAILED').length;
  const refundedCount = payments.filter((p) => p.status === 'REFUNDED').length;

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
      p.bill?.billNo?.toLowerCase().includes(search.toLowerCase()) ||
      p.bill?.patient?.user?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <DollarSign className="h-6 w-6 text-emerald-400" /> Revenue & Payment Transactions Management
            </h1>
            <p className="text-xs text-slate-400">Complete transaction ledger of processed DEMO payments</p>
          </div>
          <button
            onClick={fetchPayments}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Ledger
          </button>
        </div>

        {/* Database Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Revenue</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black font-mono text-emerald-400">${totalRevenue.toFixed(2)}</p>
            <p className="text-[10px] text-slate-500">Collected from settled payments</p>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Successful</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">{totalSuccessCount}</p>
            <p className="text-[10px] text-slate-500">Completed payments</p>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Failed Payments</span>
              <AlertCircle className="h-4 w-4 text-rose-400" />
            </div>
            <p className="text-2xl font-black text-rose-400">{failedPaymentsCount}</p>
            <p className="text-[10px] text-slate-500">Simulated failures</p>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Demo Refunds</span>
              <RotateCcw className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-purple-400">{refundedCount}</p>
            <p className="text-[10px] text-slate-500">Simulated refunds</p>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Transactions</span>
              <CreditCard className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white">{payments.length}</p>
            <p className="text-[10px] text-slate-500">Total ledger logs</p>
          </div>
        </div>

        {/* Controls & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Tx ID, Invoice #, or Patient Name..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">CARD</option>
            <option value="WALLET">WALLET</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
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
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Invoice #</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.length > 0 ? (
                    filtered.map((pym) => (
                      <tr key={pym.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-mono font-bold text-white">
                          {pym.transactionId}
                        </td>
                        <td className="py-3 px-3 text-slate-300 flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-cyan-400" /> {pym.bill?.patient?.user?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono">{pym.bill?.billNo || 'N/A'}</td>
                        <td className="py-3 px-3 font-bold text-blue-400">{pym.method}</td>
                        <td className="py-3 px-3 font-mono font-extrabold text-emerald-400">${pym.amount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-slate-400 font-mono">
                          {new Date(pym.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 font-bold rounded text-[10px] uppercase border ${
                              pym.status === 'SUCCESS'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {pym.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedBill(pym.bill)}
                            className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3 text-emerald-400" /> Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No transaction records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Printable Receipt Modal */}
        <PrintReceiptModal bill={selectedBill} isOpen={!!selectedBill} onClose={() => setSelectedBill(null)} />
      </div>
    </DashboardShell>
  );
}
