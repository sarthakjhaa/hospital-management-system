'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  AlertTriangle,
  Plus,
  Shield,
  FileText,
  CheckCircle2,
  RefreshCw,
  Clock,
  UserCheck,
  Package,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building2,
  Activity,
  UserCheck2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Doctor Modal
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [docForm, setDocForm] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    phone: '',
    departmentId: '',
    specialty: '',
    consultationFee: 750,
    availability: 'Mon-Fri (09:00 AM - 05:00 PM)',
    bio: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, deptRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/departments'),
      ]);

      if (!statsRes.ok) {
        throw new Error('Failed to load dashboard statistics from server');
      }

      const statsData = await statsRes.json();
      const deptData = await deptRes.json();

      setData(statsData);
      setDepartments(deptData.departments || []);
    } catch (err: any) {
      console.error('Admin stats fetch error:', err);
      setError(err.message || 'Error fetching real-time database metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm),
      });
      if (res.ok) {
        setShowAddDoctor(false);
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to add doctor');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-900 rounded-xl w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(11)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-900/60 border border-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-900/60 border border-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-center space-y-4 my-10">
        <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Dashboard Loading Error</h3>
        <p className="text-xs text-rose-300 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchData}
          className="py-2.5 px-5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
        >
          Try Reloading Metrics
        </button>
      </div>
    );
  }

  const counts = data?.counts || {};
  const recentPatients = data?.recentPatients || [];
  const todayAppointments = data?.todayAppointments || [];
  const recentOrders = data?.recentOrders || [];
  const recentPayments = data?.recentPayments || [];
  const lowStockItems = data?.lowStockItems || [];

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-rose-500" /> Admin Overview Dashboard
          </h1>
          <p className="text-xs text-slate-400">Live healthcare metrics, inventory status & revenue summary</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Data
          </button>
          <Link
            href="/admin/patients/new"
            className="py-2.5 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> Register Patient
          </Link>
          <button
            onClick={() => setShowAddDoctor(true)}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" /> Add Doctor
          </button>
        </div>
      </div>

      {/* PART 1 — 11 SUMMARY CARDS */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key System Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Patients */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Patients</span>
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white mt-3">{counts.patients || 0}</p>
            <span className="text-[11px] text-cyan-400 mt-1 inline-block font-semibold">Registered Records</span>
          </div>

          {/* Card 2: Total Doctors */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Doctors</span>
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <Stethoscope className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white mt-3">{counts.doctors || 0}</p>
            <span className="text-[11px] text-blue-400 mt-1 inline-block font-semibold">Active Specialists</span>
          </div>

          {/* Card 3: Total Nurses */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Nurses</span>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <UserCheck2 className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white mt-3">{counts.nurses || 0}</p>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block font-semibold">Nursing Staff</span>
          </div>

          {/* Card 4: Total Receptionists */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Receptionists</span>
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white mt-3">{counts.receptionists || 0}</p>
            <span className="text-[11px] text-amber-400 mt-1 inline-block font-semibold">Front Desk Team</span>
          </div>

          {/* Card 5: Total Pharmacists */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pharmacists</span>
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white mt-3">{counts.pharmacists || 0}</p>
            <span className="text-[11px] text-purple-400 mt-1 inline-block font-semibold">Pharmacy Team</span>
          </div>

          {/* Card 6: Today's Appointments */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Appointments</span>
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white mt-3">{counts.todayAppointments || 0}</p>
            <span className="text-[11px] text-indigo-400 mt-1 inline-block font-semibold">Scheduled Today</span>
          </div>

          {/* Card 7: Pending Appointments */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Appointments</span>
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-400 mt-3">{counts.pendingAppointments || 0}</p>
            <span className="text-[11px] text-amber-400 mt-1 inline-block font-semibold">Awaiting Confirmation</span>
          </div>

          {/* Card 8: Completed Appointments */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Visits</span>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-3">{counts.completedAppointments || 0}</p>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block font-semibold">Successful Consultations</span>
          </div>

          {/* Card 9: Total Revenue */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-3">${(counts.totalRevenue || 0).toFixed(2)}</p>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block font-semibold">Cleared Invoices</span>
          </div>

          {/* Card 10: Pending Payments */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Payments</span>
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-400 mt-3">${(counts.pendingRevenue || 0).toFixed(2)}</p>
            <span className="text-[11px] text-rose-400 mt-1 inline-block font-semibold">Unpaid Balance</span>
          </div>

          {/* Card 11: Low Stock Medicines */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Medicines</span>
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-400 mt-3">{counts.lowStockMedicines || 0}</p>
            <span className="text-[11px] text-amber-400 mt-1 inline-block font-semibold">Stock Threshold Alert</span>
          </div>
        </div>
      </div>

      {/* PART 1 — 7 DASHBOARD SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Recent Patients */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" /> Recent Patients
              </h3>
              <Link
                href="/admin/patients"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {recentPatients.length > 0 ? (
                recentPatients.map((pat: any) => (
                  <div key={pat.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{pat.user?.name}</p>
                      <p className="text-[11px] text-slate-400">{pat.patientIdCode} • {pat.gender}</p>
                    </div>
                    <Link
                      href={`/admin/patients/${pat.id}`}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-[11px]"
                    >
                      Profile
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No recent patient records created yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Today's Appointments */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-400" /> Today's Scheduled Visits
              </h3>
              <Link
                href="/admin/appointments"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((apt: any) => (
                  <div key={apt.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{apt.patient?.user?.name}</p>
                      <p className="text-[11px] text-slate-400">With {apt.doctor?.user?.name} ({apt.timeSlot})</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 font-bold text-[10px] rounded-md border border-indigo-500/30">
                      {apt.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No appointments scheduled for today.</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Recent Medicine Orders */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-400" /> Recent Medicine Orders
              </h3>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {recentOrders.length > 0 ? (
                recentOrders.map((ord: any) => (
                  <div key={ord.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">Order #{ord.id.slice(-6)}</p>
                      <p className="text-[11px] text-slate-400">Patient: {ord.patient?.user?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-400">${ord.totalAmount}</span>
                      <p className="text-[10px] text-slate-400">{ord.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No recent medicine orders placed.</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Recent Payments */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" /> Recent Payments
              </h3>
              <Link
                href="/admin/payments"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {recentPayments.length > 0 ? (
                recentPayments.map((pym: any) => (
                  <div key={pym.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{pym.bill?.patient?.user?.name}</p>
                      <p className="text-[11px] text-slate-400">{pym.method} • Tx #{pym.transactionId || pym.id.slice(-6)}</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      +${pym.amount}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No payments processed recently.</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Pharmacy Stock Alerts */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Pharmacy Low Stock Alerts
              </h3>
              <Link
                href="/admin/pharmacy"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2 mt-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((med: any) => (
                  <div
                    key={med.id}
                    className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{med.name}</p>
                      <p className="text-[10px] text-slate-400">{med.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400">Stock: {med.stock} units</span>
                      <p className="text-[10px] text-slate-400">${med.price} per unit</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">All inventory stock levels are healthy.</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 6 & 7: Appointment & Revenue Summaries */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rose-400" /> Operations & Revenue Breakdown
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Appointment Status</span>
                <p className="text-sm font-bold text-emerald-400">{counts.completedAppointments || 0} Completed</p>
                <p className="text-sm font-bold text-amber-400">{counts.pendingAppointments || 0} Pending</p>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Financial Status</span>
                <p className="text-sm font-bold text-emerald-400">${(counts.totalRevenue || 0).toFixed(2)} Collected</p>
                <p className="text-sm font-bold text-rose-400">${(counts.pendingRevenue || 0).toFixed(2)} Outstanding</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/admin/reports"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Generate Full Analytics Report <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Add Doctor Quick Modal */}
      {showAddDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Doctor Account</h3>
            <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  value={docForm.name}
                  onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                  placeholder="Dr. Eleanor Vance"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={docForm.email}
                    onChange={(e) => setDocForm({ ...docForm, email: e.target.value })}
                    placeholder="doctor@hms.com"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    required
                    value={docForm.departmentId}
                    onChange={(e) => setDocForm({ ...docForm, departmentId: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Specialty</label>
                  <input
                    type="text"
                    required
                    value={docForm.specialty}
                    onChange={(e) => setDocForm({ ...docForm, specialty: e.target.value })}
                    placeholder="Cardiology"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    required
                    value={docForm.consultationFee}
                    onChange={(e) => setDocForm({ ...docForm, consultationFee: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctor(false)}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
