'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Pill,
  Search,
  RefreshCw,
  Stethoscope,
  Calendar,
  ShoppingBag,
} from 'lucide-react';
import { formatINR, formatDoctorName } from '@/lib/doctorUtils';

export default function PatientPrescriptionsPage() {
  const router = useRouter();

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prescriptions');
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data.prescriptions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleOrderPrescription = (rx: any) => {
    const cartItems = (rx.items || []).map((item: any) => ({
      medicineId: item.medicineId,
      name: item.medicine?.name || 'Prescribed Medicine',
      price: item.medicine?.price || 35,
      quantity: item.quantity || 1,
    }));

    localStorage.setItem('hms_pharmacy_cart', JSON.stringify(cartItems));
    router.push('/patient/pharmacy?autoCheckout=true');
  };

  const filtered = prescriptions.filter((rx) => {
    const docName = rx.doctor?.user?.name || '';
    const notes = rx.notes || '';
    const itemMatch = rx.items?.some((i: any) =>
      i.medicine?.name?.toLowerCase().includes(search.toLowerCase())
    );
    return (
      docName.toLowerCase().includes(search.toLowerCase()) ||
      notes.toLowerCase().includes(search.toLowerCase()) ||
      itemMatch
    );
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Pill className="h-6 w-6 text-blue-600" /> My Prescriptions
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              View prescriptions provided by your doctor.
            </p>
          </div>
          <button
            onClick={fetchPrescriptions}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Prescriptions
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor or medicine..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Prescriptions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((rx) => (
              <div
                key={rx.id}
                className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                        <Stethoscope className="h-4 w-4 text-blue-600" />{' '}
                        {formatDoctorName(rx.doctor?.user?.name)}
                      </h3>
                      <p className="text-xs text-blue-600 font-medium">
                        {rx.doctor?.department?.name}
                      </p>
                    </div>
                  </div>

                  {rx.notes && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                      <strong className="text-slate-900">Doctor Notes:</strong> {rx.notes}
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Prescribed Medicines:
                    </span>
                    {rx.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{item.medicine?.name}</p>
                          <p className="text-[11px] text-slate-500">Dosage: {item.dosage}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-700 block">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {formatINR(item.medicine?.price || 35)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleOrderPrescription(rx)}
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" /> Order Prescribed Medicines
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs space-y-2 max-w-md mx-auto my-6 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="p-3 bg-slate-100 text-slate-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-slate-200">
              <Pill className="h-6 w-6 text-slate-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No prescriptions yet</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Prescriptions issued during your consultations will appear here.
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
