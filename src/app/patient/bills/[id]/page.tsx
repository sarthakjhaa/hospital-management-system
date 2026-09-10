'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  FileText,
  ArrowLeft,
  Printer,
  CreditCard,
  Building2,
  AlertCircle,
  User,
  Stethoscope,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import DemoPaymentModal from '@/components/shared/DemoPaymentModal';
import PrintReceiptModal from '@/components/shared/PrintReceiptModal';
import { formatINR } from '@/lib/doctorUtils';

export default function PatientBillDetailPage() {
  const routeParams = useParams();
  const billId = routeParams?.id as string;
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fetchBill = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/billing/${billId}`);
      if (res.ok) {
        const data = await res.json();
        setBill(data.bill);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to load invoice details');
      }
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while fetching invoice details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (billId) {
      fetchBill();
    }
  }, [billId]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (error || !bill) {
    return (
      <DashboardShell>
        <div className="max-w-3xl mx-auto space-y-6">
          <Link
            href="/patient/bills"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Invoices
          </Link>
          <div className="p-8 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
            <h2 className="text-lg font-bold">Error Loading Invoice</h2>
            <p className="text-xs text-rose-600">{error || 'Invoice not found or access denied.'}</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Back */}
        <div className="flex justify-between items-center">
          <Link
            href="/patient/bills"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Invoices List
          </Link>
          <div className="flex items-center gap-3">
            {bill.paymentStatus === 'UNPAID' ? (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" /> Pay Now (₹)
              </button>
            ) : (
              <button
                onClick={() => setShowPrintModal(true)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-2"
              >
                <Printer className="h-4 w-4 text-blue-600" /> Print Tax Invoice
              </button>
            )}
          </div>
        </div>

        {/* Printable Official Invoice Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-8 text-slate-900 relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-7 w-7 text-blue-600" />
                <h1 className="text-xl font-extrabold tracking-tight">Hospital Management System</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Official Clinical Billing & Financial Statement (India)</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Billing Statement</span>
              <h2 className="text-xl font-mono font-black text-blue-600">{bill.billNo}</h2>
              <span
                className={`inline-block px-2.5 py-0.5 mt-1 rounded text-[10px] font-bold uppercase border ${
                  bill.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {bill.paymentStatus}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Patient Details</span>
              <p className="font-bold text-slate-900 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-blue-600" /> {bill.patient?.user?.name || 'N/A'}
              </p>
              <p className="text-slate-600">Email: {bill.patient?.user?.email || 'N/A'}</p>
              <p className="text-slate-600">Phone: {bill.patient?.user?.phone || 'N/A'}</p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Clinical / Order Reference</span>
              {bill.appointment ? (
                <>
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="h-3.5 w-3.5 text-blue-600" /> Dr. {bill.appointment?.doctor?.user?.name}
                  </p>
                  <p className="text-slate-600">Department: {bill.appointment?.doctor?.department?.name || 'General'}</p>
                  <p className="text-slate-600">Appointment ID: #{bill.appointment?.id?.slice(-8)}</p>
                </>
              ) : bill.order ? (
                <>
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-blue-600" /> Pharmacy Order
                  </p>
                  <p className="text-slate-600">Order ID: #{bill.order?.id?.slice(-8)}</p>
                  <p className="text-slate-600">Order Status: {bill.order?.status}</p>
                </>
              ) : (
                <p className="text-slate-600">General Consultation Service</p>
              )}
              <p className="text-slate-600 flex items-center gap-1.5 pt-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Date: {new Date(bill.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Itemized Charges (₹)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bill.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-3 px-3 font-semibold text-slate-800">{item.description}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">{item.quantity || 1}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {formatINR((item.amount || 0) / (item.quantity || 1))}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{formatINR(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-500 space-y-1">
              <p>• Prices and GST calculations verified by HMS server-side billing system.</p>
              <p>• Payments processed in Indian Rupees (₹).</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">{formatINR(bill.subtotal)}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-mono font-bold">-{formatINR(bill.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax (5% GST):</span>
                <span className="font-mono font-bold">{formatINR(bill.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono text-emerald-700">{formatINR(bill.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment History if Paid */}
          {bill.payments && bill.payments.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Transaction History
              </h3>
              <div className="space-y-2">
                {bill.payments.map((p: any) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{p.transactionId}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Method: <strong className="text-slate-800">{p.method}</strong> • {new Date(p.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-700">{formatINR(p.amount)}</span>
                      <span className="block text-[10px] text-emerald-600 uppercase font-bold">{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <DemoPaymentModal
          bill={bill}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => fetchBill()}
        />

        <PrintReceiptModal bill={bill} isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} />
      </div>
    </DashboardShell>
  );
}
