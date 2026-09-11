'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Stethoscope,
  Users,
  Calendar,
  Pill,
  CreditCard,
  ArrowRight,
  HeartPulse,
  FileText,
  BarChart3,
  Search,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Globe,
  Building2,
  Award,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const SERVICES = [
  {
    icon: Search,
    title: 'Find a Doctor',
    desc: 'Search medical specialists across cardiology, neurology, pediatrics, orthopedics, and more.',
    actionText: 'Search Doctors',
    href: '/patient/doctors',
  },
  {
    icon: Calendar,
    title: 'Book an Appointment',
    desc: 'Select preferred consultation dates and time slots with instant confirmation.',
    actionText: 'Book Slot',
    href: '/patient/doctors',
  },
  {
    icon: FileText,
    title: 'Medical Records',
    desc: 'Access your health records, clinical diagnoses, treatment history, and lab reports online.',
    actionText: 'Access Records',
    href: '/login',
  },
  {
    icon: Pill,
    title: 'Prescriptions',
    desc: 'View active digital prescriptions, dosage instructions, and refill details.',
    actionText: 'View Prescriptions',
    href: '/login',
  },
  {
    icon: Pill,
    title: 'Pharmacy',
    desc: 'Check stock availability and order prescribed medications online in Indian Rupees (₹).',
    actionText: 'Visit Pharmacy',
    href: '/login',
  },
  {
    icon: CreditCard,
    title: 'Bills & Payments',
    desc: 'Review itemized consultation invoices, receipts, and payment records securely.',
    actionText: 'View Billing',
    href: '/login',
  },
];

const FEATURED_HOSPITALS = [
  {
    name: 'Sri Krishna Medical College Hospital',
    location: 'Muzaffarpur, Bihar',
    type: 'Multi-Specialty Teaching Hospital',
    beds: '500+ Beds',
    tag: 'Muzaffarpur Care',
  },
  {
    name: 'Patna Medical College Hospital',
    location: 'Patna, Bihar',
    type: 'Super-Specialty Tertiary Care',
    beds: '1,000+ Beds',
    tag: 'Patna Landmark',
  },
  {
    name: 'Ruby Hall Clinic',
    location: 'Pune, Maharashtra',
    type: 'Multi-Specialty Healthcare',
    beds: '750+ Beds',
    tag: 'Pune Center',
  },
  {
    name: 'Manipal Hospital',
    location: 'Bengaluru, Karnataka',
    type: 'Comprehensive Care & Research',
    beds: '600+ Beds',
    tag: 'Bengaluru Hub',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Find a Doctor',
    desc: 'Filter by State, District, City, specialty, or regional language.',
  },
  {
    number: '02',
    title: 'Choose a Hospital',
    desc: 'Select a convenient healthcare facility near your location.',
  },
  {
    number: '03',
    title: 'Select Time Slot',
    desc: 'Pick an available consultation day and time slot that fits your schedule.',
  },
  {
    number: '04',
    title: 'Book Appointment',
    desc: 'Confirm your appointment and manage your health records online.',
  },
];

const FEATURED_DOCTORS = [
  {
    name: 'Dr. Sneha Kumari',
    specialty: 'Gynecologist & Obstetrician',
    hospital: 'Sri Krishna Medical College Hospital',
    city: 'Muzaffarpur, Bihar',
    fee: '₹750',
    exp: '11 Years Exp.',
  },
  {
    name: 'Dr. Rahul Verma',
    specialty: 'General Physician',
    hospital: 'KGMU Lucknow Hospital',
    city: 'Lucknow, Uttar Pradesh',
    fee: '₹500',
    exp: '9 Years Exp.',
  },
  {
    name: 'Dr. Arjun Mehta',
    specialty: 'Neurologist',
    hospital: 'Manipal Hospital Bengaluru',
    city: 'Bengaluru, Karnataka',
    fee: '₹1,200',
    exp: '16 Years Exp.',
  },
];

import ThemeLanguageControls from '@/components/layout/ThemeLanguageControls';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight">
                {t('hospitalPortal')}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                Healthcare Services & Clinical Management
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Link href="#home" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('home')}</Link>
            <Link href="#services" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('servicesHeading')}</Link>
            <Link href="/patient/doctors" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
              <Search className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('doctors')}</span>
            </Link>
            <Link href="#hospitals" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('hospitalsHeading')}</Link>
          </nav>

          {/* Action Buttons, Theme & Language Controls */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeLanguageControls />
            <Link
              href="/login"
              className="py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-all"
            >
              {t('login')}
            </Link>
            <Link
              href="/register"
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>{t('getStarted')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Controls & Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeLanguageControls />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3 shadow-md">
            <nav className="flex flex-col space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Link href="#home" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-blue-600 dark:hover:text-blue-400">{t('home')}</Link>
              <Link href="#services" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-blue-600 dark:hover:text-blue-400">{t('servicesHeading')}</Link>
              <Link href="/patient/doctors" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-blue-600 dark:hover:text-blue-400">{t('findDoctor')}</Link>
              <Link href="#hospitals" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-blue-600 dark:hover:text-blue-400">{t('hospitalsHeading')}</Link>
            </nav>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {t('getStarted')}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <HeartPulse className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Healthcare Services Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Quality Healthcare, <span className="text-blue-600 dark:text-blue-400">Closer to You</span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Hospital Portal brings healthcare management to your fingertips. Find nearby hospitals, search doctors by specialty across India, check live schedule availability, book appointments, view digital prescriptions, and manage medical records seamlessly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg pt-1 text-xs text-slate-700 dark:text-slate-300 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Find nearby hospitals & doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Book consultation time slots</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Access digital health records</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Manage prescriptions & bills</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href="/patient/doctors"
                className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                <span>Find a Doctor</span>
              </Link>
              <Link
                href="/patient/doctors"
                className="py-3 px-6 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-bold text-xs rounded-xl shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] transition-all flex items-center gap-1.5"
              >
                <span>Book an Appointment</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">India Doctor Directory</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">28 States & 8 Union Territories</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                    <span>State & District Hierarchical Filter</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Select any Indian State (e.g., Bihar, Maharashtra, UP) to load all official administrative districts.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                    <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Dynamic Hospital Listings</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Filter by hospital facilities in Muzaffarpur, Patna, Gaya, Pune, Lucknow, Bengaluru, and more.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <Link
                  href="/patient/doctors"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Explore Doctor Directory</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-white dark:bg-slate-900 py-12 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Healthcare Services</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Services designed to help patients manage consultations, health records, and medical care efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.title}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-fit text-blue-600 dark:text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{srv.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{srv.desc}</p>
                  </div>

                  <div className="pt-1">
                    <Link
                      href={srv.href}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <span>{srv.actionText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section id="doctors" className="py-12 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Specialists</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Consult with verified doctors across top hospital locations in India.
            </p>
          </div>
          <Link
            href="/patient/doctors"
            className="py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5"
          >
            <span>View All Doctors</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_DOCTORS.map((doc) => (
            <div
              key={doc.name}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{doc.name}</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{doc.specialty}</p>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span className="font-bold text-slate-900 dark:text-slate-100">{doc.hospital}</span>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <MapPin className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>{doc.city}</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>{doc.exp}</span>
                  <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">{doc.fee}</span>
                </div>
              </div>

              <Link
                href="/patient/doctors"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl text-center transition-all shadow-xs block"
              >
                Book Appointment
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Hospitals Section */}
      <section id="hospitals" className="bg-white dark:bg-slate-900 py-12 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Partner Healthcare Facilities</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Integrated network of multi-specialty hospitals and medical centers across India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_HOSPITALS.map((hosp) => (
              <div
                key={hosp.name}
                className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900 px-2 py-0.5 rounded-md inline-block">
                    {hosp.tag}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{hosp.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                    <span>{hosp.location}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{hosp.type}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{hosp.beds}</span>
                  <Link
                    href="/patient/doctors"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    View Doctors →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="py-12 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How It Works</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Simple step-by-step process to book your consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((stp) => (
            <div
              key={stp.number}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900 px-2.5 py-0.5 rounded-md inline-block mb-2">
                  Step {stp.number}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{stp.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{stp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-blue-600 dark:bg-blue-700 text-white rounded-2xl p-8 text-center max-w-3xl mx-auto space-y-4 shadow-sm">
          <h2 className="text-2xl font-bold">Ready to book your consultation?</h2>
          <p className="text-blue-100 text-xs sm:text-sm max-w-md mx-auto">
            Explore our complete doctor directory across 28 States & 8 Union Territories and schedule your appointment today.
          </p>
          <div>
            <Link
              href="/patient/doctors"
              className="inline-flex items-center gap-2 py-2.5 px-6 bg-white text-blue-700 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <Search className="h-4 w-4" />
              <span>Explore Doctor Directory</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                <Activity className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">Hospital Portal</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Comprehensive Healthcare Services & Clinical Management Portal.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[10px]">Quick Links</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="#home" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link href="#services" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Services</Link></li>
              <li><Link href="/patient/doctors" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Doctors</Link></li>
              <li><Link href="#hospitals" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Hospitals</Link></li>
              <li><Link href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[10px]">Patient Care</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/patient/doctors" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Doctor Directory</Link></li>
              <li><Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Book Appointment</Link></li>
              <li><Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Login</Link></li>
              <li><Link href="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Register Account</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[10px]">Contact & Support</h4>
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>+91 1800-11-2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>support@hospitalportal.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Connaught Place, New Delhi, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 py-4 text-center text-slate-400 text-[11px]">
          © {new Date().getFullYear()} Hospital Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
