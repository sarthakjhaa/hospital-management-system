'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, ArrowLeft, ShieldCheck } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function RegisterPatientPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    phone: '',
    age: 30,
    gender: 'Male',
    address: '',
    emergencyContact: '',
    bloodGroup: 'O+',
    medicalHistory: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register patient');
      }

      router.push('/admin/patients');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <Link
          href="/admin/patients"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Patients Directory
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-cyan-400" /> Register New Patient
          </h1>
          <p className="text-xs text-slate-400">Create a new hospital patient record & generate a unique Patient ID code</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Age *</label>
                <input
                  type="number"
                  name="age"
                  required
                  min={1}
                  max={120}
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Emergency Contact *</label>
              <input
                type="text"
                name="emergencyContact"
                required
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Relative Name & Phone"
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Residential Address *</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Street Name, City, State"
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Known Medical History / Allergies</label>
              <textarea
                name="medicalHistory"
                rows={3}
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="e.g. Asthma, Penicillin allergy..."
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition-all text-sm mt-4 disabled:opacity-50"
            >
              {loading ? 'Creating Record...' : 'Complete Patient Registration'}
            </button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
