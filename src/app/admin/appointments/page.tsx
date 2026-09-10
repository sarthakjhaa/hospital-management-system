'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Calendar,
  Search,
  Filter,
  RefreshCw,
  User,
  Stethoscope,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
} from 'lucide-react';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptsRes, docsRes, deptRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/doctors'),
        fetch('/api/departments'),
      ]);

      if (aptsRes.ok) {
        const data = await aptsRes.json();
        setAppointments(data.appointments || []);
      }
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDoctors(data.doctors || []);
      }
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const todayCount = appointments.filter(
    (a) => new Date(a.date).toISOString().split('T')[0] === todayStr
  ).length;

  const pendingConfirmedCount = appointments.filter(
    (a) => a.status === 'PENDING' || a.status === 'CONFIRMED'
  ).length;

  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;

  // Filtered Appointments List
  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      apt.appointmentNo?.toLowerCase().includes(search.toLowerCase()) ||
      apt.patient?.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctor?.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    const matchesDoctor = doctorFilter === 'ALL' || apt.doctorId === doctorFilter;
    const matchesDept =
      deptFilter === 'ALL' || apt.doctor?.departmentId === deptFilter;

    const matchesDate =
      !dateFilter ||
      new Date(apt.date).toISOString().split('T')[0] === dateFilter;

    return matchesSearch && matchesStatus && matchesDoctor && matchesDept && matchesDate;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Calendar className="h-6 w-6 text-purple-400" /> Hospital Appointment Master Register
            </h1>
            <p className="text-xs text-slate-400">Complete oversight of patient bookings across all departments & doctors</p>
          </div>
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Register
          </button>
        </div>

        {/* SUMMARY CARDS (PART 13) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Visits</span>
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white mt-3">{todayCount}</p>
            <span className="text-[11px] text-indigo-400 mt-1 inline-block font-semibold">Scheduled for Today</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending / Confirmed</span>
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-blue-400 mt-3">{pendingConfirmedCount}</p>
            <span className="text-[11px] text-blue-400 mt-1 inline-block font-semibold">Active Bookings</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Visits</span>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-3">{completedCount}</p>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block font-semibold">Attended Consultations</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cancelled Bookings</span>
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-400 mt-3">{cancelledCount}</p>
            <span className="text-[11px] text-rose-400 mt-1 inline-block font-semibold">Revoked / Rescheduled</span>
          </div>
        </div>

        {/* Filters Bar (PART 13) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID (APT-XXXX), patient, doctor..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Appointment Table */}
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
                    <th className="py-3 px-2">Apt #</th>
                    <th className="py-3 px-2">Patient</th>
                    <th className="py-3 px-2">Doctor & Specialty</th>
                    <th className="py-3 px-2">Date & Time</th>
                    <th className="py-3 px-2">Fee ($)</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.length > 0 ? (
                    filtered.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-2 font-mono font-bold text-cyan-400">{apt.appointmentNo}</td>
                        <td className="py-3 px-2 font-bold text-white flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-slate-400" /> {apt.patient?.user?.name}
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          <span className="font-semibold block">Dr. {apt.doctor?.user?.name}</span>
                          <span className="text-[11px] text-blue-400">
                            {apt.doctor?.specialty} ({apt.doctor?.department?.name})
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-300 font-mono">
                          {new Date(apt.date).toLocaleDateString()} ({apt.timeSlot})
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-emerald-400">
                          ${apt.doctor?.consultationFee || 500}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2.5 py-0.5 font-bold rounded text-[10px] border ${
                              apt.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : apt.status === 'CONFIRMED'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : apt.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No appointments match current filters.
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
