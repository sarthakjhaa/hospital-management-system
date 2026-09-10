'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Package,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { formatINR } from '@/lib/doctorUtils';

export default function PatientOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        } else {
          const d = await res.json();
          setError(d.error || 'Failed to load order details');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch order');
      } finally {
        setLoading(false);
      }
    }
    fetchOrderDetail();
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this medicine order? Stock will be restored.')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (res.ok) {
        router.push('/patient/orders');
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (error || !order) {
    return (
      <DashboardShell>
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-4 max-w-md mx-auto my-10">
          <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Access Error</h3>
          <p className="text-xs text-rose-600">{error || 'Order record not found'}</p>
          <button
            onClick={() => router.push('/patient/orders')}
            className="py-2 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300"
          >
            Back to Orders
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/patient/orders')}
              className="p-2 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                Order #{order.orderNo || order.id.slice(-6)}
              </h1>
              <p className="text-xs text-slate-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-lg text-xs font-extrabold border uppercase ${
              order.status === 'DISPENSED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : order.status === 'PROCESSING'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : order.status === 'PENDING'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {order.status}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-xs">Itemized Order Items</h4>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{item.medicine?.name}</h5>
                    <p className="text-slate-500">Category: {item.medicine?.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-700 font-bold">
                      {formatINR(item.price)} x {item.quantity} = {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Subtotal:</span>
              <span>{formatINR(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-sm">
              <span>Grand Total:</span>
              <span className="text-emerald-700">{formatINR(order.totalAmount)}</span>
            </div>
          </div>

          {order.status === 'PENDING' && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleCancel}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
              >
                Cancel Order & Restore Stock
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
