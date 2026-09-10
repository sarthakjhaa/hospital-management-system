'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Pill,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Package,
  Clock,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';

export default function PharmacistDashboardPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Medicine Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [medForm, setMedForm] = useState({
    name: '',
    category: 'Analgesics / Antipyretic',
    price: 25.0,
    stock: 100,
    expiryDate: '2027-12-31',
    supplier: 'MedPharma Corp',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pharmRes, ordersRes] = await Promise.all([fetch('/api/pharmacy'), fetch('/api/orders')]);
      const pharmData = await pharmRes.json();
      const ordersData = await ordersRes.json();

      setMedicines(pharmData.medicines || []);
      setOrders(ordersData.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pharmacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medForm),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to add medicine');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const now = new Date();
  const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  // Dynamic Database Statistics (PART 9)
  const totalMedicines = medicines.length;
  const availableStock = medicines.reduce((sum, m) => sum + (m.stock > 0 ? m.stock : 0), 0);
  const lowStockCount = medicines.filter((m) => m.stock > 0 && m.stock <= 30).length;
  const expiringSoonCount = medicines.filter(
    (m) => new Date(m.expiryDate) <= sixtyDaysLater && new Date(m.expiryDate) >= now
  ).length;
  const expiredCount = medicines.filter((m) => new Date(m.expiryDate) < now).length;

  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
  const processingOrdersCount = orders.filter((o) => o.status === 'PROCESSING').length;
  const completedOrdersCount = orders.filter((o) => o.status === 'DISPENSED' || o.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Pill className="h-6 w-6 text-purple-400" /> Pharmacist Operational Dashboard
          </h1>
          <p className="text-xs text-slate-400">Live pharmaceutical metrics, inventory stock & drug order fulfillment</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Data
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20"
          >
            <Plus className="h-4 w-4" /> Add New Medicine
          </button>
        </div>
      </div>

      {/* PART 9: 8 DYNAMIC DATABASE SUMMARY CARDS */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Inventory & Orders Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Total Medicines</span>
            <p className="text-2xl font-black text-white">{totalMedicines}</p>
            <span className="text-[11px] text-purple-400 font-semibold">Catalog Items</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Available Stock</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">{availableStock} units</p>
            <span className="text-[11px] text-emerald-400 font-semibold">Total Warehouse Units</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Low Stock Medicines</span>
            <p className="text-2xl font-black text-amber-400">{lowStockCount}</p>
            <span className="text-[11px] text-amber-400 font-semibold">Reorder Alert Level</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Expiring Soon</span>
            <p className="text-2xl font-black text-rose-400">{expiringSoonCount}</p>
            <span className="text-[11px] text-rose-400 font-semibold">Within 60 Days</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Expired Medicines</span>
            <p className="text-2xl font-black text-rose-500">{expiredCount}</p>
            <span className="text-[11px] text-rose-500 font-semibold">Quarantine Stock</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Pending Orders</span>
            <p className="text-2xl font-black text-amber-400">{pendingOrdersCount}</p>
            <span className="text-[11px] text-amber-400 font-semibold">Awaiting Processing</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Processing Orders</span>
            <p className="text-2xl font-black text-blue-400">{processingOrdersCount}</p>
            <span className="text-[11px] text-blue-400 font-semibold">In Fulfillment</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Completed Orders</span>
            <p className="text-2xl font-black text-emerald-400">{completedOrdersCount}</p>
            <span className="text-[11px] text-emerald-400 font-semibold">Dispensed Orders</span>
          </div>
        </div>
      </div>

      {/* Main Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" /> Low Stock Warning Items
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {medicines.filter((m) => m.stock <= 30).length > 0 ? (
              medicines
                .filter((m) => m.stock <= 30)
                .map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex justify-between items-center"
                  >
                    <div>
                      <h5 className="font-bold text-white">{m.name}</h5>
                      <p className="text-slate-400">{m.category}</p>
                    </div>
                    <span className="font-mono font-bold text-amber-400">Stock: {m.stock} units</span>
                  </div>
                ))
            ) : (
              <p className="text-slate-500 py-6 text-center">No inventory stock alerts.</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-purple-400" /> Recent Pharmacy Orders
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {orders.length > 0 ? (
              orders.slice(0, 5).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center"
                >
                  <div>
                    <h5 className="font-bold text-white">#{ord.orderNo || ord.id.slice(-6)}</h5>
                    <p className="text-slate-400">{ord.patient?.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400">${ord.totalAmount}</span>
                    <p className="text-[10px] text-purple-400">{ord.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 py-6 text-center">No recent medicine orders.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Medicine to Pharmacy</h3>
            <form onSubmit={handleAddMedicine} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={medForm.name}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  placeholder="e.g. Ciprofloxacin 500mg"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={medForm.category}
                    onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={medForm.price}
                    onChange={(e) => setMedForm({ ...medForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    required
                    value={medForm.stock}
                    onChange={(e) => setMedForm({ ...medForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={medForm.expiryDate}
                    onChange={(e) => setMedForm({ ...medForm, expiryDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Supplier</label>
                <input
                  type="text"
                  required
                  value={medForm.supplier}
                  onChange={(e) => setMedForm({ ...medForm, supplier: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="py-2 px-4 bg-purple-600 text-white rounded-xl font-semibold">
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
