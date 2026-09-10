'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Calendar,
  Clock,
  Stethoscope,
  Building2,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { formatINR } from '@/lib/doctorUtils';

export default function PatientAppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${id}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to load appointment details');
      }
      const data = await res.json();
      setAppointment(data.appointment);
      setRescheduleDate(new Date(data.appointment.date).toISOString().split('T')[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (!showReschedule || !appointment || !rescheduleDate) return;
    async function fetchSlots() {
      setSlotsLoading(true);
      setRescheduleError(null);
      try {
        const res = await fetch(
          `/api/schedules/available-slots?doctorId=${appointment.doctorId}&date=${rescheduleDate}`
        );
        if (res.ok) {
          const data = await res.json();
          if (!data.isWorkingDay) {
            setAvailableSlots([]);
            setRescheduleError(data.message || 'Doctor is off duty on this day.');
          } else {
            setAvailableSlots(data.availableSlots || []);
            if (data.availableSlots?.length > 0) setRescheduleTime(data.availableSlots[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, [showReschedule, appointment, rescheduleDate]);

  const handleCancelConfirm = async () => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (res.ok) {
        setShowCancel(false);
        fetchDetail();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to cancel appointment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: rescheduleDate, timeSlot: rescheduleTime }),
      });
      if (res.ok) {
        setShowReschedule(false);
        fetchDetail();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to reschedule appointment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (error || !appointment) {
    return (
      <DashboardShell>
        <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 my-10 max-w-lg mx-auto">
          <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Access Error</h3>
          <p className="text-xs text-rose-600">{error || 'Appointment record not found'}</p>
          <button
            onClick={() => router.push('/patient/appointments')}
            className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300"
          >
            Return to My Appointments
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/patient/appointments')}
              className="p-2 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                Appointment #{appointment.appointmentNo}
              </h1>
              <p className="text-xs text-slate-500">
                Booked on {new Date(appointment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-lg text-xs font-extrabold border uppercase ${
              appointment.status === 'COMPLETED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : appointment.status === 'CONFIRMED'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : appointment.status === 'PENDING'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {appointment.status}
          </span>
        </div>

        {/* Appointment Card Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 font-semibold block">Doctor Name</span>
              <span className="text-slate-900 font-bold text-sm mt-1 block flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-blue-600" /> Dr. {appointment.doctor?.user?.name}
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 font-semibold block">Department & Specialty</span>
              <span className="text-blue-600 font-bold text-sm mt-1 block flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-blue-600" /> {appointment.doctor?.specialty} ({appointment.doctor?.department?.name})
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 font-semibold block">Consultation Date & Slot</span>
              <span className="text-slate-900 font-mono font-bold text-sm mt-1 block flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-purple-600" /> {new Date(appointment.date).toLocaleDateString()} at {appointment.timeSlot}
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 font-semibold block">Consultation Fee</span>
              <span className="text-emerald-700 font-mono font-black text-sm mt-1 block">
                {formatINR(appointment.doctor?.consultationFee || 500)}
              </span>
            </div>
          </div>

          {appointment.reason && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="text-slate-500 font-semibold block">Reason for Visit</span>
              <p className="text-slate-800">{appointment.reason}</p>
            </div>
          )}

          {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowReschedule(true)}
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
              >
                <RotateCcw className="h-4 w-4" /> Reschedule Appointment
              </button>
              <button
                onClick={() => setShowCancel(true)}
                className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold"
              >
                Cancel Booking
              </button>
            </div>
          )}
        </div>

        {/* Cancel Modal */}
        {showCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
              <h3 className="text-lg font-bold text-slate-900">Confirm Cancellation</h3>
              <p className="text-slate-600">Are you sure you want to cancel appointment #{appointment.appointmentNo}?</p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCancel(false)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-300"
                >
                  Back
                </button>
                <button onClick={handleCancelConfirm} className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs">
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showReschedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
              <h3 className="text-lg font-bold text-slate-900">Reschedule Appointment</h3>
              <form onSubmit={handleRescheduleSubmit} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">New Date</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Available Slots</label>
                  {slotsLoading ? (
                    <p className="text-slate-500">Loading doctor schedule...</p>
                  ) : rescheduleError ? (
                    <p className="text-rose-600 font-semibold">{rescheduleError}</p>
                  ) : (
                    <select
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
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
                    onClick={() => setShowReschedule(false)}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!rescheduleTime || availableSlots.length === 0}
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 shadow-xs"
                  >
                    Save Reschedule
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
