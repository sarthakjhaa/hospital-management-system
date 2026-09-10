import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
        <div className="inline-flex p-4 bg-rose-50 text-rose-600 rounded-2xl mb-4 border border-rose-200">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 text-sm mb-6">
          You do not have the required role permissions to access this hospital portal route.
        </p>

        <div className="flex flex-col gap-3 text-xs">
          <Link
            href="/login"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" /> Switch Role Account
          </Link>
          <Link
            href="/"
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Hospital Home
          </Link>
        </div>
      </div>
    </div>
  );
}
