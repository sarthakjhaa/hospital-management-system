'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Package, Search, RefreshCw, User } from 'lucide-react';

export default function AdminOrdersPage() {
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

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.patient?.user?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Package className="h-6 w-6 text-purple-400" /> Medicine Orders
            </h1>
            <p className="text-xs text-slate-400">Track prescription drug fulfillment & pharmacy orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders by ID or patient name..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
        </div>

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
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">Patient</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Total Amount</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.length > 0 ? (
                    filtered.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-2 font-mono font-bold text-white">#{ord.id.slice(-6)}</td>
                        <td className="py-3 px-2 text-slate-300 flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-cyan-400" /> {ord.patient?.user?.name}
                        </td>
                        <td className="py-3 px-2 text-slate-400 font-mono">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-emerald-400">${ord.totalAmount}</td>
                        <td className="py-3 px-2">
                          <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 font-bold rounded text-[10px]">
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No orders recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
