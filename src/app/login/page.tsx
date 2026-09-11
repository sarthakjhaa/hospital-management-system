'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  Stethoscope,
  Calendar,
  FileText,
  CreditCard,
  User,
  HeartPulse,
  Pill,
  Building2,
  Check,
} from 'lucide-react';
import ThemeLanguageControls from '@/components/layout/ThemeLanguageControls';
import { useI18n } from '@/lib/i18n/I18nContext';

const ACCOUNT_ROLES = [
  {
    role: 'PATIENT',
    label: 'Patient',
    desc: 'Book appointments, view records and prescriptions',
    icon: User,
    email: 'patient@hms.local',
    pass: 'Patient@123',
  },
  {
    role: 'DOCTOR',
    label: 'Doctor',
    desc: 'Manage appointments, patients and prescriptions',
    icon: Stethoscope,
    email: 'doctor@hms.local',
    pass: 'Doctor@123',
  },
  {
    role: 'NURSE',
    label: 'Nurse',
    desc: 'View assigned patients and update care information',
    icon: HeartPulse,
    email: 'nurse@hms.local',
    pass: 'Nurse@123',
  },
  {
    role: 'RECEPTIONIST',
    label: 'Receptionist',
    desc: 'Manage registrations and appointments',
    icon: Calendar,
    email: 'receptionist@hms.local',
    pass: 'Reception@123',
  },
  {
    role: 'PHARMACIST',
    label: 'Pharmacist',
    desc: 'Manage medicines and patient orders',
    icon: Pill,
    email: 'pharmacist@hms.local',
    pass: 'Pharmacy@123',
  },
  {
    role: 'ADMIN',
    label: 'Administrator',
    desc: 'Manage hospital operations and staff',
    icon: ShieldCheck,
    email: 'admin@hms.local',
    pass: 'Admin@123',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const urlError = searchParams.get('error') || '';
  const { t } = useI18n();

  const [selectedRole, setSelectedRole] = useState(ACCOUNT_ROLES[0]);
  const [email, setEmail] = useState(ACCOUNT_ROLES[0].email);
  const [password, setPassword] = useState(ACCOUNT_ROLES[0].pass);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(urlError ? 'Email or password is incorrect. Please try again.' : '');

  const handleSelectRole = (acc: typeof ACCOUNT_ROLES[0]) => {
    setSelectedRole(acc);
    setEmail(acc.email);
    setPassword(acc.pass);
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Email or password is incorrect. Please try again.');
      }

      router.push(callbackUrl || data.redirectTo);
    } catch (err: any) {
      setError(err.message || 'Email or password is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs w-full space-y-6 transition-colors">
      {/* Role Selection Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Choose account type</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select how you want to access the hospital portal.</p>
        </div>

        {/* 6 Role Cards Grid (3x2 Desktop, 2-col Mobile) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
          {ACCOUNT_ROLES.map((acc) => {
            const isSelected = selectedRole.role === acc.role;
            const IconComponent = acc.icon;
            return (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleSelectRole(acc)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[90px] ${
                  isSelected
                    ? 'bg-blue-50/50 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/10 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/60 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  {isSelected && (
                    <span className="h-4 w-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <h3 className={`text-xs font-bold leading-tight ${isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-900 dark:text-white'}`}>
                    {acc.label}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                    {acc.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* Login Form */}
      <div className="space-y-4">
        {/* Role Indicator Banner */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Signing in as <strong className="text-blue-600 dark:text-blue-400">{selectedRole.label}</strong>
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span>Remember session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link / Staff Note */}
        <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
          {selectedRole.role === 'PATIENT' ? (
            <span>
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline">
                Create Patient Account
              </Link>
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400 italic">
              Staff accounts are created by the hospital administrator.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Header Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight">
                Hospital Portal
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                Healthcare Services
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
            <Link href="/#services" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Services</Link>
            <Link href="/patient/doctors" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Doctors</Link>
            <Link href="/#hospitals" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Hospitals</Link>
            <Link href="/#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</Link>
            <Link href="/#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeLanguageControls />
            <Link
              href="/register"
              className="hidden sm:inline-flex py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              {t('register')}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 flex items-center justify-center w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Information Section */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <Stethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Healthcare Services Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Welcome to <span className="text-blue-600 dark:text-blue-400">Hospital Portal</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Access appointments, medical records and healthcare services in one place.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Book doctor appointments
                </span>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  View medical records and prescriptions
                </span>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Manage medicines and bills
                </span>
              </div>
            </div>
          </div>

          {/* Right Login Form Card */}
          <div className="lg:col-span-7 w-full max-w-lg mx-auto lg:max-w-none">
            <Suspense fallback={<div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">Loading login portal...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400">
        © 2026 Hospital Portal. All rights reserved.
      </footer>
    </div>
  );
}
