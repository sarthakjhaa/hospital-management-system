'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Plus, Eye, Edit, Trash2, ShieldAlert, ArrowLeft } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error('Fetch patients error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [query]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/patients/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchPatients();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete patient record');
      }
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
              <Users className="h-6 w-6 text-cyan-400" /> Patient Records Directory
            </h1>
            <p className="text-xs text-slate-400">View, search, register, edit and manage registered hospital patients</p>
          </div>
          <Link
            href="/admin/patients/new"
            className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20"
          >
            <Plus className="h-4 w-4" /> Register New Patient
          </Link>
        </div>

        {/* Search & Table Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Patient ID, Name, Phone, Email..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
            <span className="text-xs font-mono text-slate-400">{patients.length} records found</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading patient records...</div>
          ) : patients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-3">Patient ID</th>
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Age / Gender</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Emergency Contact</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {patients.map((pat) => (
                    <tr key={pat.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-cyan-400">{pat.patientIdCode}</td>
                      <td className="py-3 px-3 font-bold text-white">{pat.user?.name}</td>
                      <td className="py-3 px-3 text-slate-300">
                        {pat.age} yrs / {pat.gender}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{pat.user?.phone}</td>
                      <td className="py-3 px-3 text-slate-400">{pat.emergencyContact}</td>
                      <td className="py-3 px-3 flex items-center gap-2">
                        <Link
                          href={`/admin/patients/${pat.id}`}
                          className="p-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">No patient records match query.</div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
