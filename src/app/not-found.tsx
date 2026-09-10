import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
        <div className="inline-flex p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
          <FileQuestion className="h-12 w-12 text-blue-400" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-white">404 - Page Not Found</h1>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
            The requested hospital portal route does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/login"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="h-4 w-4" /> Go to Dashboard Login
          </Link>
          <Link
            href="/"
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" /> Return to Main Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
