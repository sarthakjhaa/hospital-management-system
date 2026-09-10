'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Stethoscope, Search, Plus, Eye, Trash2 } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { formatINR } from '@/lib/doctorUtils';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doctors?query=${encodeURIComponent(query)}&departmentId=${selectedDept}`);
      const data = await res.json();
      setDoctors(data.doctors || []);
      setDepartments(data.departments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [query, selectedDept]);

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm('Are you sure you want to remove this doctor account?')) return;
    try {
      const res = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      if (res.ok) fetchDoctors();
      else alert('Failed to delete doctor');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-blue-400" /> Doctors & Specialists Directory
            </h1>
            <p className="text-xs text-slate-400">View, search, onboard, edit and manage hospital medical staff</p>
          </div>
          <Link
            href="/admin/doctors/new"
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" /> Add New Doctor
          </Link>
        </div>

        {/* Filter & Table Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Doctor Name or Specialty..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
                <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
              </div>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs font-mono text-slate-400">{doctors.length} doctors listed</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading doctors catalog...</div>
          ) : doctors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-3">Doctor Name</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Specialty</th>
                    <th className="py-3 px-3">Consultation Fee</th>
                    <th className="py-3 px-3">Rating</th>
                    <th className="py-3 px-3">Availability</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-white">{doc.user?.name}</td>
                      <td className="py-3 px-3 text-slate-300">{doc.department?.name}</td>
                      <td className="py-3 px-3 text-blue-400 font-medium">{doc.specialty}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">{formatINR(doc.consultationFee)}</td>
                      <td className="py-3 px-3 font-bold text-amber-400">★ {doc.rating}</td>
                      <td className="py-3 px-3 text-slate-400">{doc.availability}</td>
                      <td className="py-3 px-3 flex items-center gap-2">
                        <Link
                          href={`/admin/doctors/${doc.id}`}
                          className="p-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> View / Schedule
                        </Link>
                        <button
                          onClick={() => handleDeleteDoctor(doc.id)}
                          className="p-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 rounded-lg text-xs font-semibold"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">No doctors match query.</div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
