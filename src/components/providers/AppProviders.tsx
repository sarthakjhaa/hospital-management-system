'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { I18nProvider } from '@/lib/i18n/I18nContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </I18nProvider>
  );
}
