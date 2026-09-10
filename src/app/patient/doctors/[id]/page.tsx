'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Mail,
  MapPin,
  Globe,
  Award,
} from 'lucide-react';
import { formatINR, parseDoctorBio, formatDoctorName } from '@/lib/doctorUtils';

export default function PatientDoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookTime, setBookTime] = useState('');
  const [bookReason, setBookReason] = useState('Consultation Visit');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedApt, setConfirmedApt] = useState<any>(null);

  const fetchDoctor = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doctors/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDoctor(data.doctor);
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

  useEffect(() => {
    if (!showBookModal || !bookDate) return;
    async function fetchSlots() {
      setSlotsLoading(true);
      setBookingError(null);
      try {
        const res = await fetch(
          `/api/schedules/available-slots?doctorId=${id}&date=${bookDate}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.isWorkingDay && data.availableSlots?.length > 0) {
            setAvailableSlots(data.availableSlots);
            setBookTime(data.availableSlots[0]);
          } else {
            setAvailableSlots([]);
            setBookTime('');
            setBookingError(data.message || 'No available slots for this date.');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, [showBookModal, bookDate, id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTime) return;

    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: id,
          date: bookDate,
          timeSlot: bookTime,
          reason: bookReason,
        }),
      });

      const d = await res.json();
      if (res.ok) {
        setShowBookModal(false);
        setConfirmedApt(d.appointment);
      } else {
        setBookingError(d.error || 'This time slot has just been booked. Please select another available time.');
        // Refresh available slots
        const slotsRes = await fetch(
          `/api/schedules/available-slots?doctorId=${id}&date=${bookDate}`
        );
        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          setAvailableSlots(slotsData.availableSlots || []);
          if (slotsData.availableSlots?.length > 0) setBookTime(slotsData.availableSlots[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setBookingError('Network connection issue. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (!doctor) {
    return (
      <DashboardShell>
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
          Doctor profile not found.
        </div>
      </DashboardShell>
    );
  }

  const meta = doctor.parsedMeta || parseDoctorBio(doctor.bio);
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-4xl">
        {/* Top Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/patient/doctors')}
              className="p-2 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                {formatDoctorName(doctor.user?.name)}
              </h1>
              <p className="text-xs text-blue-600 font-bold">
                {doctor.specialty} • {doctor.department?.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBookModal(true)}
            className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Book Appointment
          </button>
        </div>

        {/* Doctor Info Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About Doctor</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {meta.bioText || 'Experienced consultant specialist committed to compassionate clinical patient care.'}
              </p>
            </div>

            {/* Quick Metadata Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 font-semibold block text-[11px]">Consultation Fee</span>
                <span className="text-emerald-700 font-mono font-extrabold text-base mt-0.5 block">
                  {formatINR(doctor.consultationFee)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 font-semibold block text-[11px]">Experience</span>
                <span className="text-slate-900 font-bold text-sm mt-0.5 block flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-slate-500" /> {meta.experience} Years
                </span>
              </div>
            </div>

            {/* Location & Languages */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-start gap-2 text-slate-700">
                <Building2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Hospital: </span>
                  <span>{meta.hospital}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Clinic Location: </span>
                  <span>
                    {meta.city}, {meta.district}, {meta.state}, India
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-700">
                <Globe className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Languages Spoken: </span>
                  <span>{meta.languages.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Weekly Schedule Overview */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Duty Schedule</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {daysOfWeek.map((day) => {
                  const s = doctor.schedules?.find(
                    (sched: any) => sched.dayOfWeek.toLowerCase() === day.toLowerCase()
                  );
                  return (
                    <div
                      key={day}
                      className={`p-2.5 rounded-xl border flex justify-between items-center ${
                        s?.isAvailable ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-200 opacity-50'
                      }`}
                    >
                      <span className="font-semibold text-slate-800">{day}</span>
                      <span className="font-mono text-slate-600 text-[11px]">
                        {s?.isAvailable ? `${s.startTime} - ${s.endTime}` : 'Off Duty'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4 text-xs h-fit">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department Details</h3>
            <div className="space-y-3 text-slate-700">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span>{doctor.department?.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-purple-600 shrink-0" />
                <span>{doctor.user?.email}</span>
              </div>
            </div>

            <button
              onClick={() => setShowBookModal(true)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-4"
            >
              Book Appointment Now
            </button>
          </div>
        </div>

        {/* Book Appointment Modal */}
        {showBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">
                  Book Visit: {formatDoctorName(doctor.user?.name)}
                </h3>
                <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>

              {bookingError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-between">
                  <span>{bookingError}</span>
                  <button type="button" onClick={() => setBookingError(null)} className="text-amber-700 hover:text-amber-900 font-bold ml-2">✕</button>
                </div>
              )}

              <form onSubmit={handleBooking} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Date</label>
                  <input
                    type="date"
                    required
                    value={bookDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Available Slot</label>
                  {slotsLoading ? (
                    <p className="text-slate-500">Loading schedule...</p>
                  ) : availableSlots.length > 0 ? (
                    <select
                      value={bookTime}
                      onChange={(e) => setBookTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                    >
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-rose-700 font-semibold p-2 bg-rose-50 border border-rose-200 rounded-lg">
                      No available slots on this day.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    required
                    value={bookReason}
                    onChange={(e) => setBookReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading || !bookTime}
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Success Modal */}
        {confirmedApt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs text-center">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Appointment Confirmed!</h3>
              <p className="text-slate-600 font-mono">Appointment ID: #{confirmedApt.appointmentNo}</p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setConfirmedApt(null)}
                  className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-300"
                >
                  Close
                </button>
                <button
                  onClick={() => router.push(`/patient/appointments/${confirmedApt.id}`)}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  View Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
