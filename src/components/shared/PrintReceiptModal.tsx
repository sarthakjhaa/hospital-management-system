'use client';

import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { formatINR } from '@/lib/doctorUtils';

interface PrintableBill {
  billNo: string;
  createdAt: string;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentStatus: string;
  patient?: { user?: { name?: string; email?: string; phone?: string }; patientIdCode?: string };
  items?: Array<{ id: string; description: string; amount: number }>;
  payments?: Array<{ transactionId: string; method: string; createdAt: string }>;
}

interface PrintReceiptModalProps {
  bill: PrintableBill | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PrintReceiptModal({ bill, isOpen, onClose }: PrintReceiptModalProps) {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 print:p-0 print:bg-white">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl relative print:border-none print:shadow-none print:w-full">
        {/* Modal Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Hospital Tax Invoice (INR ₹)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="h-4 w-4" /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-xl font-black tracking-tight text-blue-600">
                GENERAL HOSPITAL CARE INDIA
              </h1>
              <p className="text-xs text-slate-500">Official Clinical Billing & Tax Receipt</p>
              <p className="text-xs text-slate-500">Ph: +91 1800-11-2026 | Email: billing@hospitalportal.in</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 mb-1">
                {bill.paymentStatus}
              </span>
              <p className="text-sm font-mono font-bold text-slate-900">{bill.billNo}</p>
              <p className="text-[11px] text-slate-500">
                Date: {new Date(bill.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 uppercase font-semibold">Patient Name</span>
              <p className="font-bold text-slate-900 text-sm">{bill.patient?.user?.name || 'N/A'}</p>
              <p className="text-slate-500">{bill.patient?.patientIdCode}</p>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-semibold">Contact Info</span>
              <p className="text-slate-700">{bill.patient?.user?.email || 'N/A'}</p>
              <p className="text-slate-700">{bill.patient?.user?.phone || 'N/A'}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Itemized Charges (₹)
            </h4>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items && bill.items.length > 0 ? (
                  bill.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 text-slate-800">{item.description}</td>
                      <td className="py-2.5 text-right font-mono font-medium text-slate-800">
                        {formatINR(item.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-slate-400">No items listed</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Calculations */}
          <div className="border-t border-slate-200 pt-4 space-y-1.5 text-xs text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">{formatINR(bill.subtotal)}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span className="font-mono">-{formatINR(bill.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Tax (5% GST):</span>
              <span className="font-mono">{formatINR(bill.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-200 pt-2 mt-2">
              <span>Grand Total:</span>
              <span className="text-emerald-600 font-mono">{formatINR(bill.grandTotal)}</span>
            </div>
          </div>

          {/* Payment Proof */}
          {bill.payments && bill.payments.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Transaction Ref: <strong className="font-mono">{bill.payments[0].transactionId}</strong></span>
              </div>
              <span className="font-bold uppercase">{bill.payments[0].method}</span>
            </div>
          )}

          {/* Footer stamp */}
          <div className="pt-4 text-center border-t border-slate-200 text-[10px] text-slate-400">
            This is an official computer-generated billing statement from Hospital Portal India.
          </div>
        </div>
      </div>
    </div>
  );
}
