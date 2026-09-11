'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Sync state with document.documentElement initialized by anti-flash inline script
    const isDark = document.documentElement.classList.contains('dark');
    const saved = localStorage.getItem('hms_theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      setThemeState(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } else if (isDark) {
      setThemeState('dark');
    } else {
      const match = document.cookie.match(/hms_theme=([^;]+)/);
      if (match && (match[1] === 'dark' || match[1] === 'light')) {
        setThemeState(match[1] as Theme);
        document.documentElement.classList.toggle('dark', match[1] === 'dark');
      }
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    try {
      localStorage.setItem('hms_theme', newTheme);
      document.cookie = `hms_theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (err) {
      console.error('Failed to save theme preference:', err);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
