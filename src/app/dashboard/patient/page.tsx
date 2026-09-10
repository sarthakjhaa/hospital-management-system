'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Calendar,
  FileText,
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Pill,
  Printer,
  ChevronRight,
} from 'lucide-react';
import DemoPaymentModal from '@/components/shared/DemoPaymentModal';
import PrintReceiptModal from '@/components/shared/PrintReceiptModal';
import { formatINR, formatDoctorName } from '@/lib/doctorUtils';

export default function PatientDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBookModal, setShowBookModal] = useState(false);
  const [payBill, setPayBill] = useState<any>(null);
  const [printBill, setPrintBill] = useState<any>(null);

  // Booking Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookTime, setBookTime] = useState('');
  const [bookReason, setBookReason] = useState('General Consultation');
  const [bookSymptoms, setBookSymptoms] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState<string | null>(null);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      const user = meData.user;

      if (user?.patientProfile) {
        setProfile(user.patientProfile);
        const patRes = await fetch(`/api/patients/${user.patientProfile.id}`);
        const patData = await patRes.json();
        const p = patData.patient;

        setAppointments(p.appointments || []);
        setRecords(p.medicalRecords || []);
        setBills(p.bills || []);
      }

      const docsRes = await fetch('/api/doctors');
      const docsData = await docsRes.json();
      const docsList = docsData.doctors || [];
      setDoctors(docsList);
      if (docsList.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(docsList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  // Real-time Available Time Slots Lookup
  useEffect(() => {
    if (!selectedDoctorId || !bookDate) return;
    async function fetchSlots() {
      setSlotsLoading(true);
      setBookingError(null);
      try {
        const res = await fetch(
          `/api/schedules/available-slots?doctorId=${selectedDoctorId}&date=${bookDate}`
        );
        if (res.ok) {
          const data = await res.json();
          const slots = data.availableSlots || [];
          setAvailableSlots(slots);
          if (slots.length > 0) {
            setBookTime(slots[0]);
          } else {
            setBookTime('');
            setBookingError(data.message || 'No available slots for this date. Please choose another date.');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, [selectedDoctorId, bookDate]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !bookDate || !bookTime) {
      setBookingError('Please select a valid doctor, date, and available time slot.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    const docObj = doctors.find((d) => d.id === selectedDoctorId);
    const docName = formatDoctorName(docObj?.user?.name);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          date: bookDate,
          timeSlot: bookTime,
          reason: bookReason,
          symptoms: bookSymptoms,
        }),
      });

      const d = await res.json();

      if (res.ok) {
        setShowBookModal(false);
        setBookingSuccessMessage(`Your appointment with ${docName} is confirmed for ${bookTime} on ${new Date(bookDate).toLocaleDateString()}.`);
        fetchPatientData();
      } else {
        setBookingError(d.error || 'This time slot has just been booked. Please select another available time.');
        // Refresh available slots for this doctor/date
        const slotsRes = await fetch(
          `/api/schedules/available-slots?doctorId=${selectedDoctorId}&date=${bookDate}`
        );
        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          setAvailableSlots(slotsData.availableSlots || []);
          if (slotsData.availableSlots?.length > 0) {
            setBookTime(slotsData.availableSlots[0]);
          }
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const upcomingAptsCount = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  ).length;
  const totalPrescriptionsCount = records.reduce(
    (acc, r) => acc + (r.prescriptions?.length || 0),
    0
  );
  const pendingBillsCount = bills.filter((b) => b.paymentStatus === 'UNPAID').length;

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {bookingSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-xs">Appointment Booked Successfully</p>
              <p className="text-xs text-emerald-700">{bookingSuccessMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setBookingSuccessMessage(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Patient Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {profile?.user?.name || 'Patient'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here's an overview of your appointments and healthcare information.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Link
            href="/patient/doctors"
            className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition-all flex items-center gap-1.5"
          >
            <Search className="h-4 w-4 text-blue-600" />
            <span>Find a Doctor</span>
          </Link>
          <button
            onClick={() => {
              setBookingError(null);
              setShowBookModal(true);
            }}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* 4 Small Useful Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Upcoming Appointments</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{upcomingAptsCount}</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Medical Records</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{records.length}</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Prescriptions</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{totalPrescriptionsCount}</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Pending Bills</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{pendingBillsCount}</p>
        </div>
      </div>

      {/* Quick Portal Action Buttons Bar */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Link
          href="/patient/doctors"
          className="py-2 px-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <Search className="h-3.5 w-3.5 text-blue-600" /> Find a Doctor
        </Link>
        <button
          onClick={() => setShowBookModal(true)}
          className="py-2 px-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <Calendar className="h-3.5 w-3.5 text-blue-600" /> Book Appointment
        </button>
        <Link
          href="/patient/medical-records"
          className="py-2 px-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <FileText className="h-3.5 w-3.5 text-blue-600" /> View Medical Records
        </Link>
        <Link
          href="/patient/prescriptions"
          className="py-2 px-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <Pill className="h-3.5 w-3.5 text-blue-600" /> View Prescriptions
        </Link>
        <Link
          href="/patient/bills"
          className="py-2 px-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <CreditCard className="h-3.5 w-3.5 text-blue-600" /> View Bills
        </Link>
      </div>

      {/* Grid: Appointments & Pending Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Section */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" /> My Appointments
            </h3>
            <Link
              href="/patient/appointments"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center gap-4 hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600">{apt.appointmentNo}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          apt.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : apt.status === 'CONFIRMED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">
                      {formatDoctorName(apt.doctor?.user?.name)}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {apt.doctor?.specialty} • {apt.doctor?.department?.name || 'Department'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Date: <strong>{new Date(apt.date).toLocaleDateString()}</strong> at <strong>{apt.timeSlot}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Consultation Fee</span>
                    <p className="text-sm font-bold text-slate-900 font-mono">
                      {formatINR(apt.doctor?.consultationFee || 500)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="text-xs text-slate-500">You don't have any upcoming appointments.</p>
                <button
                  onClick={() => setShowBookModal(true)}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Book an Appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bills & Payments Checkout Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" /> Pending Bills & Receipts
            </h3>
          </div>

          <div className="space-y-3">
            {bills.length > 0 ? (
              bills.map((bill) => (
                <div
                  key={bill.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-slate-900">{bill.billNo}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        bill.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {bill.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Amount</span>
                      <p className="text-sm font-extrabold text-slate-900 font-mono">
                        {formatINR(bill.grandTotal)}
                      </p>
                    </div>

                    {bill.paymentStatus === 'UNPAID' ? (
                      <button
                        onClick={() => setPayBill(bill)}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <button
                        onClick={() => setPrintBill(bill)}
                        className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <Printer className="h-3.5 w-3.5" /> Receipt
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 space-y-1">
                <p className="text-xs font-semibold text-slate-700">No pending bills</p>
                <p className="text-[11px] text-slate-500">You currently have no unpaid bills.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EHR & Medical Records History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" /> Medical Records & Prescriptions
          </h3>
          <Link
            href="/patient/medical-records"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {records.length > 0 ? (
            records.map((rec) => (
              <div key={rec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Diagnosis: {rec.diagnosis}</h4>
                    <p className="text-xs text-blue-600 font-semibold">
                      Doctor: {formatDoctorName(rec.doctor?.user?.name)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Date: {new Date(rec.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl text-xs text-slate-700 space-y-1 border border-slate-200">
                  <p><strong>Treatment Plan:</strong> {rec.treatment}</p>
                  {rec.labResults && <p><strong>Lab Results:</strong> {rec.labResults}</p>}
                </div>

                {rec.prescriptions?.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <Pill className="h-3.5 w-3.5 text-blue-600" /> Prescribed Medications:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rec.prescriptions[0].items?.map((item: any) => (
                        <div key={item.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                          <strong className="text-slate-900">{item.medicine?.name}</strong>
                          <p className="text-slate-500 text-[11px]">{item.dosage} (Qty: {item.quantity})</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 space-y-1">
              <p className="text-xs font-semibold text-slate-700">No medical records available</p>
              <p className="text-[11px] text-slate-500">Your medical records will appear here after a consultation.</p>
            </div>
          )}
        </div>
      </div>

      {/* Clean Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Book an Appointment</h3>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {bookingError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-between">
                <span>{bookingError}</span>
                <button type="button" onClick={() => setBookingError(null)} className="text-amber-700 hover:text-amber-900 font-bold ml-2">✕</button>
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Doctor</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {formatDoctorName(d.user?.name)} ({d.specialty} - {formatINR(d.consultationFee)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={bookDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Available Time</label>
                  {slotsLoading ? (
                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-500 italic">
                      Checking availability...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <select
                      value={bookTime}
                      onChange={(e) => setBookTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    >
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[11px] font-medium">
                      No slots available for this date
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason for Visit</label>
                <input
                  type="text"
                  required
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                  placeholder="Enter reason for visit"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Symptoms (Optional)</label>
                <input
                  type="text"
                  value={bookSymptoms}
                  onChange={(e) => setBookSymptoms(e.target.value)}
                  placeholder="Describe your current symptoms"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading || !bookTime || availableSlots.length === 0}
                  className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEMO Payment Gateway Modal */}
      <DemoPaymentModal
        bill={payBill}
        isOpen={!!payBill}
        onClose={() => setPayBill(null)}
        onSuccess={() => fetchPatientData()}
      />

      {/* Printable Receipt Modal */}
      <PrintReceiptModal bill={printBill} isOpen={!!printBill} onClose={() => setPrintBill(null)} />
    </div>
  );
}
