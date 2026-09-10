'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Pill, Search, Plus, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminPharmacyPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPharmacy = async () => {
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
    fetchPharmacy();
  }, []);

  const filtered = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Pill className="h-6 w-6 text-amber-400" /> Pharmacy Inventory Management
            </h1>
            <p className="text-xs text-slate-400">Monitor pharmaceutical stock, categories & medicine catalog</p>
          </div>
          <button
            onClick={fetchPharmacy}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Stock
          </button>
        </div>

        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine catalog..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
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
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.length > 0 ? (
                    filtered.map((med) => (
                      <tr key={med.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-2 font-bold text-white">{med.name}</td>
                        <td className="py-3 px-2 text-slate-400">{med.category}</td>
                        <td className="py-3 px-2 font-mono text-emerald-400 font-bold">${med.price}</td>
                        <td className="py-3 px-2 font-mono font-bold text-white">{med.stock} units</td>
                        <td className="py-3 px-2">
                          {med.stock <= 30 ? (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded text-[10px] flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3 w-3" /> Low Stock Alert
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded text-[10px] w-fit inline-block">
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No medicines found.
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
