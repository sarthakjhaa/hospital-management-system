'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { formatINR } from '@/lib/doctorUtils';
import {
  Stethoscope,
  Calendar,
  Clock,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Star,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Plus,
  AlertTriangle,
} from 'lucide-react';

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [doctor, setDoctor] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'appointments'>('profile');

  // Edit Doctor Modal State
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
  });

  const fetchDoctor = async () => {
    setLoading(true);
    try {
      const [docRes, deptRes] = await Promise.all([
        fetch(`/api/doctors/${id}`),
        fetch('/api/departments'),
      ]);

      if (docRes.ok) {
        const data = await docRes.json();
        setDoctor(data.doctor);
        setEditForm({
          name: data.doctor.user?.name || '',
          phone: data.doctor.user?.phone || '',
          departmentId: data.doctor.departmentId || '',
          specialty: data.doctor.specialty || '',
          consultationFee: data.doctor.consultationFee || 500,
          bio: data.doctor.bio || '',
          availability: data.doctor.availability || '',
        });
      }

      if (deptRes.ok) {
        const dData = await deptRes.json();
        setDepartments(dData.departments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setShowEdit(false);
        fetchDoctor();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update doctor profile');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete/deactivate this doctor account?')) return;
    try {
      const res = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/doctors');
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete doctor account');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: id,
          ...scheduleForm,
        }),
      });

      if (res.ok) {
        setShowScheduleModal(false);
        fetchDoctor();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save doctor schedule');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (!doctor) {
    return (
      <DashboardShell>
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Doctor Profile Not Found</h3>
          <button
            onClick={() => router.push('/admin/doctors')}
            className="py-2 px-4 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl"
          >
            Back to Doctors Directory
          </button>
        </div>
      </DashboardShell>
    );
  }

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/doctors')}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-blue-400" /> {doctor.user?.name}
              </h1>
              <p className="text-xs text-slate-400">
                {doctor.specialty} • {doctor.department?.name || 'General Department'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEdit(true)}
              className="py-2 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <Edit className="h-4 w-4" /> Edit Profile
            </button>
            <button
              onClick={handleDelete}
              className="py-2 px-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Delete Account
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {(['profile', 'schedule', 'appointments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab === 'profile' ? 'Profile Details' : tab === 'schedule' ? 'Weekly Schedule' : 'Assigned Appointments'}
            </button>
          ))}
        </div>

        {/* Tab 1: Doctor Profile */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                Doctor Details & Qualifications
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                  <span className="text-slate-500 block font-semibold">Specialty</span>
                  <span className="text-white font-bold text-sm mt-1 block">{doctor.specialty}</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                  <span className="text-slate-500 block font-semibold">Department</span>
                  <span className="text-blue-400 font-bold text-sm mt-1 block">
                    {doctor.department?.name || 'Unassigned'}
                  </span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                  <span className="text-slate-500 block font-semibold">Consultation Fee</span>
                  <span className="text-emerald-400 font-mono font-black text-sm mt-1 block">
                    {formatINR(doctor.consultationFee)}
                  </span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                  <span className="text-slate-500 block font-semibold">Rating</span>
                  <span className="text-amber-400 font-bold text-sm mt-1 block">★ {doctor.rating} / 5.0</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-xs space-y-1">
                <span className="text-slate-500 block font-semibold">Working Hours & Shift</span>
                <p className="text-slate-200 font-medium">{doctor.availability || 'Standard Hours'}</p>
              </div>

              {doctor.bio && (
                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-xs space-y-1">
                  <span className="text-slate-500 block font-semibold">Professional Bio</span>
                  <p className="text-slate-300 leading-relaxed">{doctor.bio}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                Contact Information
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>{doctor.user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{doctor.user?.phone || 'No phone recorded'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Weekly Schedule */}
        {activeTab === 'schedule' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Configured Duty Schedule</h3>
                <p className="text-xs text-slate-400">Manage available consultation days and time windows</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add / Configure Day Slot
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daysOfWeek.map((day) => {
                const daySchedule = doctor.schedules?.find((s: any) => s.dayOfWeek === day);
                return (
                  <div
                    key={day}
                    className={`p-4 rounded-2xl border ${
                      daySchedule
                        ? 'bg-slate-950/80 border-slate-800'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-extrabold text-xs text-white">{day}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          daySchedule?.isAvailable
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {daySchedule?.isAvailable ? 'Available' : 'Off Duty'}
                      </span>
                    </div>

                    {daySchedule ? (
                      <div className="text-xs text-slate-300 font-mono flex items-center gap-1.5 mt-2">
                        <Clock className="h-3.5 w-3.5 text-blue-400" />
                        <span>
                          {daySchedule.startTime} - {daySchedule.endTime}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-2">No shift schedule defined</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Doctor Appointments */}
        {activeTab === 'appointments' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Recent Assigned Appointments</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-2">Patient</th>
                    <th className="py-3 px-2">Date & Slot</th>
                    <th className="py-3 px-2">Type / Reason</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {doctor.appointments?.length > 0 ? (
                    doctor.appointments.map((apt: any) => (
                      <tr key={apt.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-2 font-bold text-white">{apt.patient?.user?.name}</td>
                        <td className="py-3 px-2 text-slate-300 font-mono">
                          {new Date(apt.date).toLocaleDateString()} ({apt.timeSlot})
                        </td>
                        <td className="py-3 px-2 text-slate-400">{apt.reason || 'General Consultation'}</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded text-[10px]">
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                        No appointments found for this doctor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Doctor Modal */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Edit Doctor Profile</h3>
              <form onSubmit={handleUpdate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Department</label>
                    <select
                      value={editForm.departmentId}
                      onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
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
                      value={editForm.specialty}
                      onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Fee (₹)</label>
                    <input
                      type="number"
                      value={editForm.consultationFee}
                      onChange={(e) => setEditForm({ ...editForm, consultationFee: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Working Hours</label>
                  <input
                    type="text"
                    value={editForm.availability}
                    onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="py-2 px-4 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-xl font-bold">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Config Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Configure Shift Slot</h3>
              <form onSubmit={handleSaveSchedule} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Day of Week</label>
                  <select
                    value={scheduleForm.dayOfWeek}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={scheduleForm.isAvailable}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, isAvailable: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-blue-600"
                  />
                  <label htmlFor="isAvailable" className="text-slate-300 font-medium">
                    Available for consultations on this day
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="py-2 px-4 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-xl font-bold">
                    Save Schedule
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
