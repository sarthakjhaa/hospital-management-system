'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  CreditCard,
  Search,
  RefreshCw,
  Eye,
  Printer,
  Info,
} from 'lucide-react';
import DemoPaymentModal from '@/components/shared/DemoPaymentModal';
import PrintReceiptModal from '@/components/shared/PrintReceiptModal';
import { formatINR } from '@/lib/doctorUtils';

export default function PatientBillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals State
  const [payBill, setPayBill] = useState<any>(null);
  const [printBill, setPrintBill] = useState<any>(null);

  const fetchBills = async () => {
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
    fetchBills();
  }, []);

  const filtered = bills.filter((b) => {
    const matchesSearch =
      b.billNo?.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <CreditCard className="h-6 w-6 text-blue-600" /> Patient Invoices & Billing Statements
            </h1>
            <p className="text-xs text-slate-500">View hospital charges, consultation fees & pay invoices in Indian Rupees (₹)</p>
          </div>
          <button
            onClick={fetchBills}
            className="p-2.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices by Invoice # (INV-XXXX)..."
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

        {/* Invoices List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-900">{b.billNo}</span>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Issued: {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        b.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : b.paymentStatus === 'UNPAID'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {b.paymentStatus}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Itemized Summary:</span>
                    {b.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-slate-700">
                        <span>{item.description}</span>
                        <span className="font-mono font-bold">{formatINR(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Grand Total</span>
                    <span className="text-base font-extrabold text-emerald-700 font-mono">
                      {formatINR(b.grandTotal)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/patient/bills/${b.id}`}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>

                    {b.paymentStatus === 'UNPAID' ? (
                      <button
                        onClick={() => setPayBill(b)}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <button
                        onClick={() => setPrintBill(b)}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <Printer className="h-3.5 w-3.5" /> Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
            No invoices found.
          </div>
        )}

        {/* Payment Gateway Modal */}
        <DemoPaymentModal
          bill={payBill}
          isOpen={!!payBill}
          onClose={() => setPayBill(null)}
          onSuccess={() => fetchBills()}
        />

        {/* Printable Receipt Modal */}
        <PrintReceiptModal bill={printBill} isOpen={!!printBill} onClose={() => setPrintBill(null)} />
      </div>
    </DashboardShell>
  );
}
