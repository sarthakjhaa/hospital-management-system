'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Calendar,
  Clock,
  RefreshCw,
  XCircle,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { formatINR } from '@/lib/doctorUtils';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');

  // Cancel Modal State
  const [cancelApt, setCancelApt] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  // Reschedule Modal State
  const [rescheduleApt, setRescheduleApt] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch available slots when reschedule date changes
  useEffect(() => {
    if (!rescheduleApt || !rescheduleDate) return;
    async function fetchSlots() {
      setSlotsLoading(true);
      setRescheduleError(null);
      try {
        const res = await fetch(
          `/api/schedules/available-slots?doctorId=${rescheduleApt.doctorId}&date=${rescheduleDate}`
        );
        if (res.ok) {
          const data = await res.json();
          if (!data.isWorkingDay) {
            setAvailableSlots([]);
            setRescheduleError(data.message || 'Doctor is off duty on this day.');
          } else {
            setAvailableSlots(data.availableSlots || []);
            if (data.availableSlots?.length > 0) {
              setRescheduleTime(data.availableSlots[0]);
            } else {
              setRescheduleError('No available time slots for this date. Please choose another day.');
            }
          }
        }
      } catch (err) {
        console.error(err);
      } fontFinally: {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, [rescheduleApt, rescheduleDate]);

  const [actionError, setActionError] = useState<string | null>(null);

  const handleCancelConfirm = async () => {
    if (!cancelApt) return;
    setCancelling(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/appointments/${cancelApt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (res.ok) {
        setCancelApt(null);
        fetchAppointments();
      } else {
        const d = await res.json();
        setActionError(d.error || 'Failed to cancel appointment');
      }
    } catch (err) {
      console.error(err);
      setActionError('Network connection issue. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleRescheduleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApt || !rescheduleDate || !rescheduleTime) return;
    setRescheduling(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/appointments/${rescheduleApt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: rescheduleDate,
          timeSlot: rescheduleTime,
        }),
      });

      if (res.ok) {
        setRescheduleApt(null);
        fetchAppointments();
      } else {
        const d = await res.json();
        setActionError(d.error || 'Failed to reschedule appointment');
      }
    } catch (err) {
      console.error(err);
      setActionError('Network connection issue. Please try again.');
    } finally {
      setRescheduling(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingList = appointments.filter(
    (a) =>
      a.status !== 'CANCELLED' &&
      a.status !== 'COMPLETED' &&
      new Date(a.date) >= today
  );

  const pastList = appointments.filter(
    (a) => a.status === 'COMPLETED' || (a.status !== 'CANCELLED' && new Date(a.date) < today)
  );

  const cancelledList = appointments.filter((a) => a.status === 'CANCELLED');

  const currentList =
    activeTab === 'UPCOMING' ? upcomingList : activeTab === 'PAST' ? pastList : cancelledList;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Calendar className="h-6 w-6 text-blue-600" /> My Appointments
            </h1>
            <p className="text-xs text-slate-500">Track upcoming doctor visits, past consultations & cancellations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAppointments}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <Link
              href="/patient/doctors"
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Book New Appointment
            </Link>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'UPCOMING'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Upcoming ({upcomingList.length})
          </button>
          <button
            onClick={() => setActiveTab('PAST')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'PAST'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed / Past ({pastList.length})
          </button>
          <button
            onClick={() => setActiveTab('CANCELLED')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'CANCELLED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <XCircle className="h-3.5 w-3.5" /> Cancelled ({cancelledList.length})
          </button>
        </div>

        {/* Appointment Cards List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentList.map((apt) => (
              <div
                key={apt.id}
                className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-blue-600">{apt.appointmentNo}</span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">Dr. {apt.doctor?.user?.name}</h3>
                      <p className="text-xs text-blue-600 font-medium">
                        {apt.doctor?.specialty} • {apt.doctor?.department?.name || 'Department'}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        apt.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : apt.status === 'CONFIRMED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : apt.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-500 block text-[10px]">Scheduled Date</span>
                      <span className="text-slate-900 font-mono font-bold">
                        {new Date(apt.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-500 block text-[10px]">Time Slot</span>
                      <span className="text-blue-600 font-mono font-bold">{apt.timeSlot}</span>
                    </div>
                  </div>

                  {apt.reason && (
                    <p className="text-xs text-slate-600 mt-3">
                      <strong>Reason:</strong> {apt.reason}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Consultation Fee</span>
                    <span className="text-sm font-black text-emerald-700 font-mono">
                      {formatINR(apt.doctor?.consultationFee || 500)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/patient/appointments/${apt.id}`}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-300"
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </Link>

                    {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                      <>
                        <button
                          onClick={() => {
                            setRescheduleApt(apt);
                            setRescheduleDate(new Date(apt.date).toISOString().split('T')[0]);
                          }}
                          className="py-1.5 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Reschedule
                        </button>
                        <button
                          onClick={() => setCancelApt(apt)}
                          className="py-1.5 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
            No {activeTab.toLowerCase()} appointments found.
          </div>
        )}

        {/* Clean Cancel Confirmation Modal */}
        {cancelApt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 shrink-0 text-rose-600" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Cancel Appointment #{cancelApt.appointmentNo}?</h4>
                  <p className="text-[11px] text-rose-600">Are you sure you want to cancel this booking?</p>
                </div>
              </div>

              {actionError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-between">
                  <span>{actionError}</span>
                  <button type="button" onClick={() => setActionError(null)} className="text-amber-700 font-bold ml-2">✕</button>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="text-slate-800">Doctor: <strong>Dr. {cancelApt.doctor?.user?.name}</strong></p>
                <p className="text-slate-600">Date: {new Date(cancelApt.date).toLocaleDateString()} ({cancelApt.timeSlot})</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActionError(null);
                    setCancelApt(null);
                  }}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-300"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={cancelling}
                  className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clean Reschedule Modal */}
        {rescheduleApt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-blue-600" /> Reschedule Appointment #{rescheduleApt.appointmentNo}
              </h3>

              {actionError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-between">
                  <span>{actionError}</span>
                  <button type="button" onClick={() => setActionError(null)} className="text-amber-700 font-bold ml-2">✕</button>
                </div>
              )}

              <form onSubmit={handleRescheduleConfirm} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select New Date</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Available Time Slot</label>
                  {slotsLoading ? (
                    <p className="text-slate-500">Fetching doctor availability...</p>
                  ) : rescheduleError ? (
                    <p className="text-rose-600 font-semibold">{rescheduleError}</p>
                  ) : (
                    <select
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    >
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRescheduleApt(null)}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rescheduling || !rescheduleTime || availableSlots.length === 0}
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50 shadow-xs"
                  >
                    {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
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
