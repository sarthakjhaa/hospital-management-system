'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import { CreditCard, Search, RefreshCw, Eye, CheckCircle2, Clock } from 'lucide-react';
import PrintReceiptModal from '@/components/shared/PrintReceiptModal';
import { formatINR } from '@/lib/doctorUtils';

export default function PatientPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Print Receipt Modal
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<any>(null);

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

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
      p.bill?.billNo?.toLowerCase().includes(search.toLowerCase());

    const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const totalPaid = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const recentPayment = payments.length > 0 ? payments[0] : null;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-600" /> Payments
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              View your consultation, medicine and hospital payment history.
            </p>
          </div>
          <button
            onClick={fetchPayments}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Payments
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1">
            <span className="text-slate-500 font-semibold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Total Paid
            </span>
            <span className="text-xl font-extrabold text-emerald-700 font-mono block">
              {formatINR(totalPaid)}
            </span>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1">
            <span className="text-slate-500 font-semibold text-xs flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-600" /> Pending Bills
            </span>
            <span className="text-xl font-extrabold text-slate-900 font-mono block">
              {formatINR(0)}
            </span>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1">
            <span className="text-slate-500 font-semibold text-xs flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-blue-600" /> Recent Payment
            </span>
            <span className="text-xl font-extrabold text-slate-900 font-mono block">
              {recentPayment ? formatINR(recentPayment.amount) : '₹0'}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Transaction ID or Invoice Number..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Credit/Debit Card</option>
            <option value="WALLET">Digital Wallet</option>
            <option value="CASH">Cash</option>
          </select>
        </div>

        {/* Payments Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Transaction ID</th>
                    <th className="py-3 px-3">Invoice Number</th>
                    <th className="py-3 px-3">Payment Method</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length > 0 ? (
                    filtered.map((pym) => (
                      <tr key={pym.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 text-slate-600 font-mono">
                          {new Date(pym.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {pym.transactionId}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {pym.bill?.billNo ? (
                            <Link
                              href={`/patient/bills/${pym.bill.id}`}
                              className="text-blue-600 hover:underline font-bold"
                            >
                              {pym.bill.billNo}
                            </Link>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{pym.method}</td>
                        <td className="py-3 px-3 font-mono font-extrabold text-emerald-700 text-sm">
                          {formatINR(pym.amount)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 font-bold rounded-md text-[10px] uppercase border ${
                              pym.status === 'SUCCESS' || pym.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {pym.status === 'SUCCESS' ? 'Paid' : pym.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedBillForReceipt(pym.bill)}
                            className="py-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye className="h-3 w-3" /> View Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 text-sm">No payment records found</p>
                          <p className="text-xs">Your hospital and pharmacy payment receipts will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Print Receipt Modal */}
        <PrintReceiptModal
          bill={selectedBillForReceipt}
          isOpen={!!selectedBillForReceipt}
          onClose={() => setSelectedBillForReceipt(null)}
        />
      </div>
    </DashboardShell>
  );
}
