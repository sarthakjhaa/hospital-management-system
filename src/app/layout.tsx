import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { AppProviders } from '@/components/providers/AppProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hospital Management System (HMS) - Healthcare Portal',
  description: 'Comprehensive Web-Based Hospital Management System & Healthcare Portal.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
