'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (dept: any) => {
    setEditingDept(dept);
    setForm({ name: dept.name, description: dept.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDept ? `/api/departments/${editingDept.id}` : '/api/departments';
      const method = editingDept ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        fetchDepartments();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save department');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the '${name}' department?`)) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDepartments();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete department');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Building2 className="h-6 w-6 text-blue-400" /> Hospital Departments Management
            </h1>
            <p className="text-xs text-slate-400">Configure medical specialties & department structures</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDepartments}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button
              onClick={handleOpenAdd}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="h-4 w-4" /> Add Department
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
        </div>

        {/* Departments Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((dept) => (
              <div
                key={dept.id}
                className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-400" /> {dept.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id, dept.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {dept.description || 'General hospital medical department.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1 font-semibold">
                    <Stethoscope className="h-3.5 w-3.5 text-cyan-400" /> Assigned Doctors:
                  </span>
                  <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                    {dept._count?.doctors || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-500 text-xs">
            No departments match your filter.
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Cardiology"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description of department services..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">
                    Save Department
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
