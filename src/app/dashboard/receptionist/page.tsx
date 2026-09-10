'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Calendar, CreditCard, Search, Stethoscope, CheckCircle2, Clock, Plus, User } from 'lucide-react';
import PrintReceiptModal from '@/components/shared/PrintReceiptModal';

export default function ReceptionistDashboardPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'appointments' | 'register' | 'billing'>('appointments');

  // New Patient Form State
  const [patForm, setPatForm] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    phone: '',
    age: 35,
    gender: 'Male',
    address: '',
    emergencyContact: '',
    bloodGroup: 'O+',
    medicalHistory: '',
  });

  // New Booking State
  const [bookDoctorId, setBookDoctorId] = useState('');
  const [bookPatientId, setBookPatientId] = useState('');
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookTime, setBookTime] = useState('10:00 AM');
  const [bookReason, setBookReason] = useState('Routine Checkup & Consultation');

  // Printable Receipt Modal State
  const [printBill, setPrintBill] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patsRes, docsRes, aptsRes, billsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/doctors'),
        fetch('/api/appointments'),
        fetch('/api/billing'),
      ]);

      const patsData = await patsRes.json();
      const docsData = await docsRes.json();
      const aptsData = await aptsRes.json();
      const billsData = await billsRes.json();

      setPatients(patsData.patients || []);
      setDoctors(docsData.doctors || []);
      setAppointments(aptsData.appointments || []);
      setBills(billsData.bills || []);

      if (patsData.patients?.length > 0) setBookPatientId(patsData.patients[0].id);
      if (docsData.doctors?.length > 0) setBookDoctorId(docsData.doctors[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patForm),
      });

      if (res.ok) {
        alert('Patient registered successfully!');
        setPatForm({
          name: '',
          email: '',
          password: 'Password@123',
          phone: '',
          age: 35,
          gender: 'Male',
          address: '',
          emergencyContact: '',
          bloodGroup: 'O+',
          medicalHistory: '',
        });
        fetchData();
        setActiveTab('appointments');
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to register patient');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: bookDoctorId,
          patientId: bookPatientId,
          date: bookDate,
          timeSlot: bookTime,
          reason: bookReason,
        }),
      });

      if (res.ok) {
        alert('Appointment booked successfully!');
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to book appointment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAptStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-amber-400" /> Hospital Reception Desk
        </h1>
        <p className="text-xs text-slate-400">Patient check-in, appointment management, doctor schedule lookup & billing</p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'appointments'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Manage Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'register'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Register Walk-In Patient
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'billing'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Billing & Invoices ({bills.length})
        </button>
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointment List */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="h-5 w-5 text-amber-400" /> All Patient Appointments
            </h3>

            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">{apt.appointmentNo}</span>
                      <span className="text-xs font-bold text-white">{apt.patient?.user?.name}</span>
                    </div>
                    <p className="text-xs text-blue-400 font-medium">Doctor: {apt.doctor?.user?.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Date: {new Date(apt.date).toLocaleDateString()} | Slot: {apt.timeSlot}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {apt.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateAptStatus(apt.id, 'CONFIRMED')}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                      >
                        Confirm
                      </button>
                    )}
                    {apt.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleUpdateAptStatus(apt.id, 'CANCELLED')}
                        className="py-1.5 px-3 bg-rose-600/20 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl hover:bg-rose-600/30"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Book Appointment */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Book New Appointment</h3>
            <form onSubmit={handleBookAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Patient</label>
                <select
                  value={bookPatientId}
                  onChange={(e) => setBookPatientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.name} ({p.patientIdCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Doctor</label>
                <select
                  value={bookDoctorId}
                  onChange={(e) => setBookDoctorId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.user?.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Slot</label>
                  <input
                    type="text"
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Visit</label>
                <input
                  type="text"
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg mt-2"
              >
                Confirm Appointment Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register Tab */}
      {activeTab === 'register' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 max-w-2xl mx-auto shadow-xl">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-4">
            Register New Walk-In Patient
          </h3>
          <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={patForm.name}
                  onChange={(e) => setPatForm({ ...patForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={patForm.email}
                  onChange={(e) => setPatForm({ ...patForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Phone *</label>
                <input
                  type="text"
                  required
                  value={patForm.phone}
                  onChange={(e) => setPatForm({ ...patForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Age *</label>
                <input
                  type="number"
                  required
                  value={patForm.age}
                  onChange={(e) => setPatForm({ ...patForm, age: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Gender *</label>
                <select
                  value={patForm.gender}
                  onChange={(e) => setPatForm({ ...patForm, gender: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Address *</label>
              <input
                type="text"
                required
                value={patForm.address}
                onChange={(e) => setPatForm({ ...patForm, address: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Emergency Contact *</label>
              <input
                type="text"
                required
                value={patForm.emergencyContact}
                onChange={(e) => setPatForm({ ...patForm, emergencyContact: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg mt-3"
            >
              Generate Patient Record & Code
            </button>
          </form>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <CreditCard className="h-5 w-5 text-amber-400" /> Patient Billing & Printable Receipts
          </h3>

          <div className="space-y-3">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-200">{bill.billNo}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        bill.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {bill.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">Patient: {bill.patient?.user?.name}</p>
                  <p className="text-xs text-slate-400">Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase">Grand Total</span>
                    <p className="text-lg font-black text-emerald-400 font-mono">${bill.grandTotal.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => setPrintBill(bill)}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                  >
                    View / Print Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <PrintReceiptModal bill={printBill} isOpen={!!printBill} onClose={() => setPrintBill(null)} />
    </div>
  );
}
