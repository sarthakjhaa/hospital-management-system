'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Package,
  Search,
  RefreshCw,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';

export default function PharmacistOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setSelectedOrder(null);
        fetchOrders();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNo?.toLowerCase().includes(search.toLowerCase()) ||
      ord.patient?.user?.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Package className="h-6 w-6 text-purple-400" /> Pharmacist Order Fulfillment Desk
            </h1>
            <p className="text-xs text-slate-400">Process, dispense & fulfill patient online medicine orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Orders
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID or patient name..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="DISPENSED">DISPENSED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-2">Order #</th>
                    <th className="py-3 px-2">Patient</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Items Count</th>
                    <th className="py-3 px-2">Total Amount</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Fulfillment Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.length > 0 ? (
                    filtered.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-2 font-mono font-bold text-purple-400">
                          #{ord.orderNo || ord.id.slice(-6)}
                        </td>
                        <td className="py-3 px-2 text-slate-300 font-bold flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-cyan-400" /> {ord.patient?.user?.name}
                        </td>
                        <td className="py-3 px-2 text-slate-400 font-mono">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 text-slate-300 font-mono">{ord.items?.length || 0} items</td>
                        <td className="py-3 px-2 font-mono font-bold text-emerald-400">
                          ${ord.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                              ord.status === 'DISPENSED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : ord.status === 'PROCESSING'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : ord.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" /> Inspect
                            </button>

                            {ord.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'PROCESSING')}
                                className="py-1 px-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg"
                              >
                                Process
                              </button>
                            )}

                            {ord.status === 'PROCESSING' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'DISPENSED')}
                                className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg"
                              >
                                Dispense
                              </button>
                            )}

                            {ord.status !== 'CANCELLED' && ord.status !== 'DISPENSED' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}
                                className="py-1 px-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-[11px] font-bold rounded-lg"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No orders match current query filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">
                  Order Inspection: #{selectedOrder.orderNo || selectedOrder.id.slice(-6)}
                </h3>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                  Close
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-slate-300">Patient: <strong>{selectedOrder.patient?.user?.name}</strong></p>
                <p className="text-slate-400 font-mono">Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-purple-400 uppercase">Requested Medicines:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedOrder.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-white">{item.medicine?.name}</p>
                        <p className="text-[10px] text-slate-400">Unit Price: ${item.price}</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        Qty: {item.quantity} (${(item.price * item.quantity).toFixed(2)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Grand Total</span>
                  <p className="text-base font-black text-emerald-400 font-mono">
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  {selectedOrder.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING')}
                      className="py-2 px-4 bg-blue-600 text-white font-bold rounded-xl"
                    >
                      Start Processing
                    </button>
                  )}
                  {selectedOrder.status === 'PROCESSING' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'DISPENSED')}
                      className="py-2 px-4 bg-emerald-600 text-white font-bold rounded-xl"
                    >
                      Complete & Dispense
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
