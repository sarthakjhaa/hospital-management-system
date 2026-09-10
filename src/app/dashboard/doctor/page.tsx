'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, FileText, Plus, CheckCircle, Clock, Stethoscope, Pill, AlertCircle } from 'lucide-react';

export default function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Diagnosis Modal State
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [labResults, setLabResults] = useState('');
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [selectedMeds, setSelectedMeds] = useState<Array<{ medicineId: string; dosage: string; quantity: number }>>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptsRes, medsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/pharmacy'),
      ]);
      const aptsData = await aptsRes.json();
      const medsData = await medsRes.json();

      setAppointments(aptsData.appointments || []);
      setMedicines(medsData.medicines || []);
    } catch (err) {
      console.error('Fetch doctor data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMedRow = () => {
    if (medicines.length > 0) {
      setSelectedMeds([...selectedMeds, { medicineId: medicines[0].id, dosage: '1 tablet twice daily', quantity: 10 }]);
    }
  };

  const handleRemoveMedRow = (index: number) => {
    setSelectedMeds(selectedMeds.filter((_, i) => i !== index));
  };

  const handleSubmitEHR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApt) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedApt.id,
          patientId: selectedApt.patientId,
          diagnosis,
          treatment,
          labResults,
          prescriptionNotes,
          medicines: selectedMeds,
        }),
      });

      if (res.ok) {
        setSelectedApt(null);
        setDiagnosis('');
        setTreatment('');
        setLabResults('');
        setSelectedMeds([]);
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to submit EHR record');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
          <Stethoscope className="h-6 w-6 text-blue-400" /> Doctor Clinical Portal
        </h1>
        <p className="text-xs text-slate-400">View patient appointments, issue diagnoses & write electronic prescriptions</p>
      </div>

      {/* Appointments List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" /> Assigned Patient Consultations
          </h3>
          <span className="text-xs font-mono text-slate-400">{appointments.length} Consultations</span>
        </div>

        <div className="space-y-3">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-5 bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-blue-400">{apt.appointmentNo}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${
                      apt.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : apt.status === 'CONFIRMED'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" /> {apt.patient?.user?.name || 'Patient'}
                </h4>
                <p className="text-xs text-slate-400">
                  Date: <strong className="text-slate-200">{new Date(apt.date).toLocaleDateString()}</strong> at{' '}
                  <strong className="text-slate-200">{apt.timeSlot}</strong>
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  <strong>Reason:</strong> {apt.reason}
                </p>
                {apt.symptoms && (
                  <p className="text-xs text-purple-300">
                    <strong>Reported Symptoms:</strong> {apt.symptoms}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {apt.status !== 'COMPLETED' && (
                  <button
                    onClick={() => {
                      setSelectedApt(apt);
                      setSelectedMeds([]);
                    }}
                    className="py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add EHR & Prescription
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EHR & Electronic Prescription Modal */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Electronic Health Record (EHR)</h3>
                <p className="text-xs text-slate-400">Patient: {selectedApt.patient?.user?.name} ({selectedApt.appointmentNo})</p>
              </div>
              <button
                onClick={() => setSelectedApt(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmitEHR} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Clinical Diagnosis *</label>
                <textarea
                  required
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute bronchitis, elevated resting BP..."
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Recommended Treatment Plan *</label>
                <textarea
                  required
                  rows={2}
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="e.g. Complete 5-day antibiotic course, bed rest, hydration..."
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Laboratory & Test Notes (Optional)</label>
                <input
                  type="text"
                  value={labResults}
                  onChange={(e) => setLabResults(e.target.value)}
                  placeholder="e.g. Chest X-Ray clear. Blood sugar: 110 mg/dL"
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              {/* Prescription Items */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-blue-400 flex items-center gap-1.5">
                    <Pill className="h-4 w-4" /> Prescribed Medicines
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMedRow}
                    className="py-1 px-3 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold hover:bg-blue-600/30"
                  >
                    + Add Medicine
                  </button>
                </div>

                {selectedMeds.map((medRow, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-center">
                    <div className="col-span-5">
                      <select
                        value={medRow.medicineId}
                        onChange={(e) => {
                          const copy = [...selectedMeds];
                          copy[idx].medicineId = e.target.value;
                          setSelectedMeds(copy);
                        }}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      >
                        {medicines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} (${m.price})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Dosage instruction"
                        value={medRow.dosage}
                        onChange={(e) => {
                          const copy = [...selectedMeds];
                          copy[idx].dosage = e.target.value;
                          setSelectedMeds(copy);
                        }}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min={1}
                        value={medRow.quantity}
                        onChange={(e) => {
                          const copy = [...selectedMeds];
                          copy[idx].quantity = parseInt(e.target.value) || 1;
                          setSelectedMeds(copy);
                        }}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedRow(idx)}
                        className="text-rose-400 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedApt(null)}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
                >
                  {submitting ? 'Saving...' : 'Finalize EHR & Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
