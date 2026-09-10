'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope, ArrowLeft, ShieldCheck } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function AddDoctorPage() {
  const router = useRouter();

  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Doctor@123',
    phone: '',
    departmentId: '',
    specialty: '',
    consultationFee: 750,
    availability: 'Mon-Fri (09:00 AM - 05:00 PM)',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDepts() {
      try {
        const res = await fetch('/api/departments');
        const data = await res.json();
        setDepartments(data.departments || []);
        if (data.departments?.length > 0) {
          setFormData((prev) => ({ ...prev, departmentId: data.departments[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchDepts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'consultationFee' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create doctor account');
      }

      router.push('/admin/doctors');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <Link
          href="/admin/doctors"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Doctors Directory
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-blue-400" /> Onboard New Doctor
          </h1>
          <p className="text-xs text-slate-400">Create a new doctor staff account & assign department schedule</p>
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

            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Weekly Availability Matrix *</label>
              <input
                type="text"
                name="availability"
                required
                value={formData.availability}
                onChange={handleChange}
                placeholder="Mon-Fri (09:00 AM - 05:00 PM)"
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Professional Biography</label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Clinical experience, certifications, and sub-specialties..."
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all text-sm mt-4 disabled:opacity-50"
            >
              {loading ? 'Creating Doctor Account...' : 'Complete Doctor Onboarding'}
            </button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
