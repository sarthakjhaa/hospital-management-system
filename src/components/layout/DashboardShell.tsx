'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  User,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  Pill,
  CreditCard,
  LogOut,
  Search,
  Shield,
  Menu,
  X,
  Home,
  Building2,
  Package,
  DollarSign,
  BarChart3,
  Settings,
  History,
  Bell,
  CheckCheck,
} from 'lucide-react';

import ThemeLanguageControls from './ThemeLanguageControls';
import { useI18n } from '@/lib/i18n/I18nContext';
import { TranslationKey } from '@/lib/i18n/dictionary';

interface UserSessionData {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'PHARMACIST' | 'PATIENT';
}

const ROLE_NAV_ITEMS: Record<string, Array<{ label: string; href: string; icon: any }>> = {
  ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Activity },
    { label: 'Patients', href: '/admin/patients', icon: Users },
    { label: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
    { label: 'Departments', href: '/admin/departments', icon: Building2 },
    { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { label: 'Medical Records', href: '/admin/medical-records', icon: FileText },
    { label: 'Pharmacy', href: '/admin/pharmacy', icon: Pill },
    { label: 'Medicine Orders', href: '/admin/orders', icon: Package },
    { label: 'Billing', href: '/admin/billing', icon: CreditCard },
    { label: 'Payments', href: '/admin/payments', icon: DollarSign },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'Users', href: '/admin/users', icon: Shield },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: History },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
    { label: 'Profile', href: '/admin/profile', icon: User },
  ],
  DOCTOR: [
    { label: 'Dashboard', href: '/doctor/dashboard', icon: Activity },
    { label: 'Appointments', href: '/doctor/dashboard?tab=appointments', icon: Calendar },
    { label: 'Patients', href: '/doctor/dashboard?tab=patients', icon: Users },
    { label: 'Medical Records', href: '/doctor/dashboard?tab=records', icon: FileText },
    { label: 'Prescriptions', href: '/doctor/dashboard?tab=prescriptions', icon: Pill },
    { label: 'Schedule', href: '/doctor/dashboard?tab=schedule', icon: Calendar },
    { label: 'Profile', href: '/doctor/dashboard?tab=profile', icon: User },
  ],
  NURSE: [
    { label: 'Dashboard', href: '/nurse/dashboard', icon: Activity },
    { label: 'Wards & Beds', href: '/nurse/dashboard?tab=wards', icon: Building2 },
    { label: 'Assigned Patients', href: '/nurse/dashboard?tab=patients', icon: Users },
    { label: 'Appointments', href: '/nurse/dashboard?tab=appointments', icon: Calendar },
  ],
  RECEPTIONIST: [
    { label: 'Dashboard', href: '/receptionist/dashboard', icon: Activity },
    { label: 'Register Patient', href: '/receptionist/dashboard?tab=register', icon: User },
    { label: 'Appointments', href: '/receptionist/dashboard?tab=appointments', icon: Calendar },
    { label: 'Doctors', href: '/receptionist/dashboard?tab=doctors', icon: Stethoscope },
    { label: 'Billing', href: '/receptionist/dashboard?tab=billing', icon: CreditCard },
  ],
  PHARMACIST: [
    { label: 'Dashboard', href: '/pharmacist/dashboard', icon: Activity },
    { label: 'Medicine Inventory', href: '/pharmacist/inventory', icon: Pill },
    { label: 'Medicine Orders', href: '/pharmacist/orders', icon: Package },
    { label: 'Profile', href: '/pharmacist/dashboard?tab=profile', icon: User },
  ],
  PATIENT: [
    { label: 'Dashboard', href: '/patient/dashboard', icon: Activity },
    { label: 'Find Doctor', href: '/patient/doctors', icon: Stethoscope },
    { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { label: 'Medical Records', href: '/patient/medical-records', icon: FileText },
    { label: 'Prescriptions', href: '/patient/prescriptions', icon: Pill },
    { label: 'Pharmacy', href: '/patient/pharmacy', icon: Package },
    { label: 'Medicine Orders', href: '/patient/orders', icon: Package },
    { label: 'Bills', href: '/patient/bills', icon: CreditCard },
    { label: 'Payments', href: '/patient/payments', icon: DollarSign },
  ],
};

const NAV_KEY_MAP: Record<string, TranslationKey> = {
  Dashboard: 'dashboard',
  Patients: 'patients',
  Doctors: 'doctors',
  Departments: 'departments',
  Appointments: 'appointments',
  'Medical Records': 'medicalRecords',
  Pharmacy: 'pharmacy',
  'Medicine Orders': 'medicineOrders',
  Billing: 'bills',
  Payments: 'payments',
  Reports: 'reports',
  Users: 'users',
  'Audit Logs': 'auditLogs',
  Settings: 'settings',
  Profile: 'profile',
  Prescriptions: 'prescriptions',
  'Find Doctor': 'findDoctor',
  Bills: 'bills',
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  ADMIN: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
  DOCTOR: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
  NURSE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
  RECEPTIONIST: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
  PHARMACIST: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800',
  PATIENT: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800',
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  const [user, setUser] = useState<UserSessionData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    }
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = user ? ROLE_NAV_ITEMS[user.role] || [] : [];
  const searchPlaceholder =
    user?.role === 'PATIENT'
      ? `${t('search')} ${t('doctors').toLowerCase()}, ${t('appointments').toLowerCase()}...`
      : `${t('search')} ${t('patients').toLowerCase()}, ${t('doctors').toLowerCase()}...`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 text-white rounded-xl shadow-xs">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white hidden sm:inline text-base">
              {t('hospitalPortal')}
            </span>
          </Link>
        </div>

        {/* Role-Sensitive Search Bar */}
        <div className="flex-1 max-w-md mx-4 relative hidden sm:block">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Search Dropdown Overlay */}
          {searchResults && (
            <div className="absolute top-11 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 text-xs space-y-3 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  {t('search')} Results
                </span>
                <button
                  onClick={() => setSearchResults(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[10px]"
                >
                  {t('close')}
                </button>
              </div>

              {searchResults.patients?.length > 0 && (
                <div>
                  <h5 className="font-bold text-blue-600 dark:text-blue-400 mb-1">{t('patients')}</h5>
                  {searchResults.patients.map((p: any) => (
                    <div key={p.id} className="py-1 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex justify-between">
                      <span><strong>{p.user?.name}</strong> ({p.patientIdCode})</span>
                      <Link href={`/admin/patients/${p.id}`} onClick={() => setSearchResults(null)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">View</Link>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.doctors?.length > 0 && (
                <div>
                  <h5 className="font-bold text-blue-600 dark:text-blue-400 mb-1">{t('doctors')}</h5>
                  {searchResults.doctors.map((d: any) => (
                    <div key={d.id} className="py-1 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex justify-between">
                      <span><strong>{d.user?.name}</strong> ({d.specialty})</span>
                      <Link href={`/patient/doctors/${d.id}`} onClick={() => setSearchResults(null)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">{t('viewProfile')}</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Controls, Theme & Language */}
        <div className="flex items-center gap-3">
          {/* THEME TOGGLE (ONLY ONE ICON) & COMPREHENSIVE LANGUAGE SELECTOR */}
          <ThemeLanguageControls />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 rounded text-[10px] font-bold border border-rose-200 dark:border-rose-800">
                        {unreadCount} Unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkRead(n.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          !n.isRead
                            ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-slate-100'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-slate-400 text-xs">No notifications yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {user && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${
                ROLE_BADGE_COLORS[user.role]
              }`}
            >
              {user.role}
            </span>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title={t('logout')}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Layout Container: Fixed Sidebar + Main Scrollable Content */}
      <div className="flex-1 flex relative">
        {/* Desktop Fixed Sidebar */}
        <aside className="fixed top-16 left-0 bottom-0 w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-3 hidden md:flex flex-col justify-between z-30">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              MAIN MENU
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const displayLabel = NAV_KEY_MAP[item.label] ? t(NAV_KEY_MAP[item.label]) : item.label;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{displayLabel}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 text-center">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Home className="h-3.5 w-3.5" /> {t('landingPage')}
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs md:hidden flex flex-col p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col max-h-full shadow-xl">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Navigation Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const displayLabel = NAV_KEY_MAP[item.label] ? t(NAV_KEY_MAP[item.label]) : item.label;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{displayLabel}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 ml-0 md:ml-60 p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
