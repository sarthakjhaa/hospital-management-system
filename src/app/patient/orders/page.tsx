'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Package,
  Search,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { formatINR } from '@/lib/doctorUtils';

export default function PatientOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string, orderNo: string) => {
    if (!confirm(`Are you sure you want to cancel medicine order #${orderNo}? Stock will be returned to inventory.`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (res.ok) {
        fetchOrders();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = orders.filter(
    (o) =>
      o.orderNo?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Package className="h-6 w-6 text-purple-600" /> My Medicine Orders
            </h1>
            <p className="text-xs text-slate-500">Track prescription drug fulfillment & pharmacy purchases</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="p-2.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <Link
              href="/patient/pharmacy"
              className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Pharmacy Store
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders by Order #..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((ord) => (
              <div
                key={ord.id}
                className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-mono font-bold text-purple-600">
                        #{ord.orderNo || ord.id.slice(-6)}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        Placed: {new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        ord.status === 'DISPENSED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : ord.status === 'PROCESSING'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : ord.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Ordered Items ({ord.items?.length || 0}):</span>
                    {ord.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-xs text-slate-700">
                        <span>{item.medicine?.name} (x{item.quantity})</span>
                        <span className="font-mono font-bold">{formatINR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Amount</span>
                    <span className="text-sm font-black text-emerald-700 font-mono">
                      {formatINR(ord.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/patient/orders/${ord.id}`}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </Link>

                    {ord.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelOrder(ord.id, ord.orderNo || ord.id.slice(-6))}
                        className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
            No medicine orders found.
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
