'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, LanguageOption } from './languages';
import { DICTIONARY, TranslationKey } from './dictionary';

interface I18nContextType {
  language: string;
  currentLanguageOption: LanguageOption;
  setLanguage: (code: string) => void;
  t: (key: TranslationKey) => string;
  languages: LanguageOption[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>('en');

  useEffect(() => {
    // Read stored language from localStorage or cookie
    const saved = localStorage.getItem('hms_lang');
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      setLanguageState(saved);
    } else {
      const match = document.cookie.match(/hms_lang=([^;]+)/);
      if (match && LANGUAGES.some((l) => l.code === match[1])) {
        setLanguageState(match[1]);
      }
    }
  }, []);

  const setLanguage = (code: string) => {
    if (!LANGUAGES.some((l) => l.code === code)) return;
    setLanguageState(code);
    try {
      localStorage.setItem('hms_lang', code);
      document.cookie = `hms_lang=${code}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (err) {
      console.error('Failed to save language preference:', err);
    }
  };

  const currentLanguageOption =
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const t = (key: TranslationKey): string => {
    const langDict = DICTIONARY[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const fallbackDict = DICTIONARY['en'];
    return fallbackDict[key] || key;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        currentLanguageOption,
        setLanguage,
        t,
        languages: LANGUAGES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
