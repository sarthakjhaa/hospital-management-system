'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  CreditCard,
  Search,
  RefreshCw,
  User,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
} from 'lucide-react';
import PrintReceiptModal from '@/components/shared/PrintReceiptModal';
import { formatINR } from '@/lib/doctorUtils';

export default function AdminBillingPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Bill for Receipt Modal
  const [selectedBill, setSelectedBill] = useState<any>(null);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing');
      if (res.ok) {
        const data = await res.json();
        setBills(data.bills || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  // Compute Summary Statistics dynamically from DB data
  const totalBills = bills.length;
  const paidBills = bills.filter((b) => b.paymentStatus === 'PAID').length;
  const pendingBills = bills.filter((b) => b.paymentStatus === 'UNPAID').length;
  const totalRevenue = bills
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((acc, b) => acc + (b.grandTotal || 0), 0);
  const totalPendingAmount = bills
    .filter((b) => b.paymentStatus === 'UNPAID')
    .reduce((acc, b) => acc + (b.grandTotal || 0), 0);

  const filtered = bills.filter((b) => {
    const matchesSearch =
      b.billNo?.toLowerCase().includes(search.toLowerCase()) ||
      b.patient?.user?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <CreditCard className="h-6 w-6 text-blue-600" /> Admin Billing & Invoice Control Center
            </h1>
            <p className="text-xs text-slate-500">View hospital billing records, consultation fees & revenue metrics (INR ₹)</p>
          </div>
          <button
            onClick={fetchBilling}
            className="p-2.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Bills
          </button>
        </div>

        {/* Database Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Total Bills</span>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{totalBills}</p>
            <p className="text-[10px] text-slate-500">All issued invoices</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Paid Bills</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-600">{paidBills}</p>
            <p className="text-[10px] text-slate-500">Settled invoices</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Pending Bills</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-600">{pendingBills}</p>
            <p className="text-[10px] text-slate-500">Unpaid balance</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Total Revenue</span>
              <span className="font-bold text-emerald-600">₹</span>
            </div>
            <p className="text-2xl font-black font-mono text-emerald-700">{formatINR(totalRevenue)}</p>
            <p className="text-[10px] text-slate-500">Collected funds</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Pending Amount</span>
              <span className="font-bold text-rose-600">₹</span>
            </div>
            <p className="text-2xl font-black font-mono text-rose-600">{formatINR(totalPendingAmount)}</p>
            <p className="text-[10px] text-slate-500">Outstanding dues</p>
          </div>
        </div>

        {/* Controls & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Invoice # (INV-XXXX) or Patient Name..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PAID">PAID</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3 px-3">Invoice #</th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Bill Date</th>
                    <th className="py-3 px-3">Subtotal</th>
                    <th className="py-3 px-3">Tax (GST)</th>
                    <th className="py-3 px-3">Grand Total</th>
                    <th className="py-3 px-3">Payment Status</th>
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length > 0 ? (
                    filtered.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{b.billNo}</td>
                        <td className="py-3 px-3 text-slate-800 font-medium flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-blue-600" /> {b.patient?.user?.name || 'Unknown Patient'}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono">{formatINR(b.subtotal)}</td>
                        <td className="py-3 px-3 text-slate-600 font-mono">{formatINR(b.tax)}</td>
                        <td className="py-3 px-3 font-mono font-extrabold text-emerald-700">
                          {formatINR(b.grandTotal)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 font-bold rounded text-[10px] uppercase border ${
                              b.paymentStatus === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : b.paymentStatus === 'UNPAID'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {b.appointmentId
                            ? `Apt #${b.appointmentId.slice(-6)}`
                            : b.orderId
                            ? `Order #${b.orderId.slice(-6)}`
                            : 'General'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedBill(b)}
                            className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3 text-blue-600" /> Invoice
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        No billing records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Printable Receipt / Invoice Modal */}
        <PrintReceiptModal bill={selectedBill} isOpen={!!selectedBill} onClose={() => setSelectedBill(null)} />
      </div>
    </DashboardShell>
  );
}
