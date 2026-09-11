'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';
import {
  QrCode,
  ShieldCheck,
  X,
  AlertTriangle,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Wallet,
  CreditCard,
  Building2,
  Smartphone,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { formatINR } from '@/lib/doctorUtils';

const HOSPITAL_UPI_ID = 'sarthakjha19-1@okhdfcbank';
const PAYEE_NAME = 'Hospital Portal';

type PaymentTab = 'UPI' | 'QR' | 'CARD' | 'NETBANKING' | 'WALLET';

interface BillData {
  id: string;
  billNo: string;
  grandTotal: number;
  paymentStatus?: string;
  patient?: { user?: { name?: string } };
}

interface DemoPaymentModalProps {
  bill: BillData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentResult: any) => void;
}

const INDIAN_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Kotak Mahindra Bank',
  'Other Banks',
];

const WALLET_OPTIONS = [
  { id: 'Paytm Wallet', name: 'Paytm', desc: 'Pay using Paytm Wallet balance' },
  { id: 'PhonePe Wallet', name: 'PhonePe', desc: 'Pay via PhonePe Wallet & UPI' },
  { id: 'Mobikwik', name: 'Mobikwik', desc: 'Instant 1-click payment' },
  { id: 'Amazon Pay', name: 'Amazon Pay', desc: 'Pay using Amazon Pay balance' },
];

export default function DemoPaymentModal({
  bill,
  isOpen,
  onClose,
  onSuccess,
}: DemoPaymentModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('UPI');
  const [view, setView] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Form States
  const [upiId, setUpiId] = useState('yourname@upi');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardHolder, setCardHolder] = useState('Patient Name');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen && bill) {
      setActiveTab('UPI');
      setView('FORM');
      setError('');
      setCopied(false);
      setPaymentResult(null);
    }
  }, [isOpen, bill]);

  // Generate dynamic QR code whenever QR Code tab is selected or bill changes
  useEffect(() => {
    if (isOpen && bill && bill.grandTotal && activeTab === 'QR') {
      setQrLoading(true);
      const amount = Number(bill.grandTotal);
      const formattedAmount = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
      const upiUri = `upi://pay?pa=${encodeURIComponent(HOSPITAL_UPI_ID)}&pn=${encodeURIComponent(
        PAYEE_NAME
      )}&am=${formattedAmount}&cu=INR`;

      QRCode.toDataURL(upiUri, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => {
          console.error('Failed to generate dynamic UPI QR code:', err);
          setError('Could not generate UPI QR code. Please try again.');
        })
        .finally(() => setQrLoading(false));
    }
  }, [isOpen, bill, activeTab]);

  if (!isOpen || !bill) return null;

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(HOSPITAL_UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy UPI ID:', err);
    }
  };

  const handleExecutePayment = async () => {
    setLoading(true);
    setError('');

    // Method Mapping for DB enum
    let dbMethod: 'UPI' | 'CARD' | 'WALLET' = 'UPI';
    if (activeTab === 'CARD') dbMethod = 'CARD';
    if (activeTab === 'NETBANKING' || activeTab === 'WALLET') dbMethod = 'WALLET';

    // Simple Field Validation
    if (activeTab === 'UPI' && (!upiId || !upiId.includes('@'))) {
      setError('Please enter a valid UPI ID (e.g. username@upi)');
      setLoading(false);
      return;
    }

    if (activeTab === 'CARD' && (!cardNumber || cardNumber.length < 12)) {
      setError('Please enter a valid 16-digit card number');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: bill.id,
          amount: bill.grandTotal,
          method: dbMethod,
          upiId: activeTab === 'UPI' ? upiId : HOSPITAL_UPI_ID,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment could not be recorded. Please try again.');
      }

      setPaymentResult(data);
      setView('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Payment could not be recorded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSuccess = () => {
    if (paymentResult) {
      onSuccess(paymentResult);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">Complete Payment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Choose your preferred payment method
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto pr-0.5 flex-1 custom-scrollbar">
          {view === 'FORM' ? (
            <div className="space-y-6">
              {/* Top Banner Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Invoice Number
                  </span>
                  <p className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {bill.billNo}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Hospital
                  </span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Hospital Portal</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Amount Payable
                  </span>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {formatINR(bill.grandTotal)}
                  </p>
                </div>
              </div>

              {/* 5 Payment Method Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('UPI');
                    setError('');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    activeTab === 'UPI'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  <span>UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('QR');
                    setError('');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    activeTab === 'QR'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  <span>QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('CARD');
                    setError('');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    activeTab === 'CARD'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('NETBANKING');
                    setError('');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    activeTab === 'NETBANKING'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('WALLET');
                    setError('');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 col-span-2 sm:col-span-1 ${
                    activeTab === 'WALLET'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  <span>Wallet</span>
                </button>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Main Gateway Content Area + Payment Summary Sidebar */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-7 space-y-4">
                  {/* TAB 1: UPI PAYMENT */}
                  {activeTab === 'UPI' && (
                    <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Pay via UPI ID</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Enter your VPA / UPI handle to make payment</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          UPI ID / VPA
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Example: patient@okaxis, user@paytm, name@ybl
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleExecutePayment}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Pay {formatINR(bill.grandTotal)}</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>or pay using QR code</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('QR')}
                          className="text-blue-600 hover:text-blue-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          <span>View QR Code</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: QR CODE PAYMENT */}
                  {activeTab === 'QR' && (
                    <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 text-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Dynamic UPI QR Code</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Scan to pay with any UPI app</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block max-w-full">
                        {qrLoading ? (
                          <div className="w-48 h-48 flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
                            <span className="text-xs text-slate-500">Generating QR...</span>
                          </div>
                        ) : qrCodeUrl ? (
                          <img
                            src={qrCodeUrl}
                            alt="UPI QR Code"
                            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg mx-auto"
                          />
                        ) : (
                          <div className="p-6 text-xs text-rose-600">Failed to render QR Code</div>
                        )}
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                        <div className="text-left min-w-0 flex-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">
                            UPI ID:
                          </span>
                          <span className="font-mono font-bold text-slate-900 truncate block text-xs">
                            {HOSPITAL_UPI_ID}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpiId}
                          className="py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold text-xs flex items-center gap-1 hover:bg-slate-100 shrink-0"
                        >
                          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleExecutePayment}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Confirm & Pay {formatINR(bill.grandTotal)}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* TAB 3: CREDIT / DEBIT CARD */}
                  {activeTab === 'CARD' && (
                    <div className="space-y-3.5 bg-white p-5 rounded-2xl border border-slate-200 text-xs">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Credit / Debit Card</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Pay securely using Visa, MasterCard or RuPay</p>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 0000 0000 1234"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Expiry (MM / YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">CVV</label>
                          <input
                            type="password"
                            value={cardCvv}
                            maxLength={3}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="***"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name as on card"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleExecutePayment}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 pt-2"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Pay {formatINR(bill.grandTotal)}</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* TAB 4: NET BANKING */}
                  {activeTab === 'NETBANKING' && (
                    <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 text-xs">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Net Banking</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Select your bank from the list</p>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">Select Your Bank</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          {INDIAN_BANKS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleExecutePayment}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Continue to Pay {formatINR(bill.grandTotal)}</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* TAB 5: WALLET */}
                  {activeTab === 'WALLET' && (
                    <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 text-xs">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Digital Wallets</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Choose your wallet account</p>
                      </div>

                      <div className="space-y-2">
                        {WALLET_OPTIONS.map((w) => (
                          <label
                            key={w.id}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              selectedWallet === w.id
                                ? 'bg-blue-50/60 border-blue-600 text-blue-900 ring-1 ring-blue-600/20'
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="walletGroup"
                                checked={selectedWallet === w.id}
                                onChange={() => setSelectedWallet(w.id)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <div>
                                <span className="font-bold text-xs block">{w.name}</span>
                                <span className="text-[10px] text-slate-500">{w.desc}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleExecutePayment}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Continue to Pay {formatINR(bill.grandTotal)}</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* SIDEBAR: ALWAYS VISIBLE PAYMENT SUMMARY */}
                <div className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                  <div>
                    <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-2">
                      Payment Summary
                    </h4>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Invoice:</span>
                      <span className="font-mono font-bold text-slate-900">{bill.billNo}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Hospital:</span>
                      <span className="font-bold text-slate-800">Hospital Portal</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">Amount:</span>
                      <span className="font-mono font-extrabold text-emerald-600 text-sm">
                        {formatINR(bill.grandTotal)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">Payment Method:</span>
                      <span className="font-bold text-blue-600">
                        {activeTab === 'QR' ? 'UPI (QR Code)' : activeTab}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-slate-400 leading-relaxed border-t border-slate-200/60">
                    🔒 256-Bit SSL Encrypted Healthcare Portal Payment.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SUCCESS VIEW */
            <div className="space-y-6 py-6 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-slate-900">Payment Successful</h4>
                <p className="text-xs text-slate-600">Payment recorded successfully.</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs space-y-3 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Invoice</span>
                  <span className="font-mono font-bold text-slate-900">{bill.billNo}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Amount Paid</span>
                  <span className="font-mono font-bold text-emerald-600 text-base">
                    {formatINR(bill.grandTotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Payment Method</span>
                  <span className="font-bold text-slate-800">{paymentResult?.payment?.method || activeTab}</span>
                </div>

                {paymentResult?.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Transaction ID</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {paymentResult.transactionId}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href={`/patient/bills/${bill.id}`}
                  onClick={onClose}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>View Invoice</span>
                </Link>

                <button
                  type="button"
                  onClick={handleFinishSuccess}
                  className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


