'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Pill,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default function PharmacistInventoryPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState<any>(null);
  const [medForm, setMedForm] = useState({
    name: '',
    category: 'Analgesics / Antipyretic',
    price: 25.0,
    stock: 100,
    expiryDate: '2027-12-31',
    supplier: 'MedPharma Corp',
    description: '',
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pharmacy');
      if (res.ok) {
        const data = await res.json();
        setMedicines(data.medicines || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenAdd = () => {
    setEditingMed(null);
    setMedForm({
      name: '',
      category: 'Analgesics / Antipyretic',
      price: 25.0,
      stock: 100,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      supplier: 'MedPharma Corp',
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (med: any) => {
    setEditingMed(med);
    setMedForm({
      name: med.name,
      category: med.category,
      price: med.price,
      stock: med.stock,
      expiryDate: new Date(med.expiryDate).toISOString().split('T')[0],
      supplier: med.supplier,
      description: med.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMed ? `/api/pharmacy/${editingMed.id}` : '/api/pharmacy';
      const method = editingMed ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medForm),
      });

      if (res.ok) {
        setShowModal(false);
        fetchInventory();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save medicine');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove '${name}' from inventory catalog?`)) return;
    try {
      const res = await fetch(`/api/pharmacy/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchInventory();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to remove medicine');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const now = new Date();
  const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const filtered = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(search.toLowerCase()) ||
      med.category.toLowerCase().includes(search.toLowerCase()) ||
      med.id.toLowerCase().includes(search.toLowerCase());

    const isExpired = new Date(med.expiryDate) < now;
    const isExpiringSoon = new Date(med.expiryDate) <= sixtyDaysLater && new Date(med.expiryDate) >= now;
    const isLowStock = med.stock <= 30;

    let matchesStatus = true;
    if (statusFilter === 'LOW_STOCK') matchesStatus = isLowStock;
    if (statusFilter === 'EXPIRED') matchesStatus = isExpired;
    if (statusFilter === 'EXPIRING_SOON') matchesStatus = isExpiringSoon;
    if (statusFilter === 'AVAILABLE') matchesStatus = med.stock > 0 && !isExpired;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Pill className="h-6 w-6 text-purple-400" /> Pharmacy Inventory Management
            </h1>
            <p className="text-xs text-slate-400">Maintain drug catalog, stock levels, suppliers & expiry windows</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchInventory}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button
              onClick={handleOpenAdd}
              className="py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Medicine
            </button>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Medicine ID, name or category..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Inventory Statuses</option>
            <option value="AVAILABLE">In Stock & Valid</option>
            <option value="LOW_STOCK">Low Stock (≤ 30 units)</option>
            <option value="EXPIRING_SOON">Expiring Soon (≤ 60 Days)</option>
            <option value="EXPIRED">Expired Batch</option>
          </select>
        </div>

        {/* Inventory Catalog Table */}
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
                    <th className="py-3 px-2">Medicine Name</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Unit Price ($)</th>
                    <th className="py-3 px-2">Stock Level</th>
                    <th className="py-3 px-2">Expiry Date</th>
                    <th className="py-3 px-2">Supplier</th>
                    <th className="py-3 px-2">Status Alert</th>
                    <th className="py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.length > 0 ? (
                    filtered.map((med) => {
                      const isExpired = new Date(med.expiryDate) < now;
                      const isExpiringSoon = new Date(med.expiryDate) <= sixtyDaysLater && !isExpired;
                      const isLowStock = med.stock <= 30;

                      return (
                        <tr key={med.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-2 font-bold text-white">{med.name}</td>
                          <td className="py-3 px-2 text-slate-300">{med.category}</td>
                          <td className="py-3 px-2 font-mono font-bold text-emerald-400">${med.price.toFixed(2)}</td>
                          <td className="py-3 px-2 font-mono font-bold text-white">{med.stock} units</td>
                          <td className="py-3 px-2 text-slate-400 font-mono">
                            {new Date(med.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 text-slate-400">{med.supplier}</td>
                          <td className="py-3 px-2">
                            {isExpired ? (
                              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-bold rounded text-[10px] border border-rose-500/30">
                                EXPIRED
                              </span>
                            ) : isExpiringSoon ? (
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded text-[10px] border border-amber-500/30">
                                EXPIRING SOON
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded text-[10px] border border-amber-500/30">
                                LOW STOCK
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded text-[10px]">
                                HEALTHY
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(med)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(med.id, med.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No medicines match query filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
              <h3 className="text-lg font-bold text-white">
                {editingMed ? 'Edit Inventory Item' : 'Add New Medicine Item'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={medForm.name}
                    onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
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
                    <label className="block text-slate-300 font-semibold mb-1">Stock Quantity</label>
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

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="py-2 px-4 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="py-2 px-4 bg-purple-600 text-white rounded-xl font-bold">
                    Save Inventory
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
