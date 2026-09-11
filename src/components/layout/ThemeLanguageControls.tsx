'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Globe, Search, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function ThemeLanguageControls() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, currentLanguageOption, languages } = useI18n();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const filteredLanguages = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex items-center gap-2">
      {/* 1. COMPREHENSIVE INDIAN LANGUAGE SELECTOR DROPDOWN */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
          aria-label="Select website language"
          aria-expanded={dropdownOpen}
          title="Select Language"
        >
          <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="truncate max-w-[100px] font-medium">
            {currentLanguageOption.nativeName}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-11 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input for 24 Languages */}
            <div className="relative mb-2 px-1 pt-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language / भाषा खोजें..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
            </div>

            {/* Language Options List */}
            <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => {
                  const isSelected = lang.code === language;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setDropdownOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.nativeName}</span>
                        {lang.name !== lang.nativeName && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({lang.name})
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                    </button>
                  );
                })
              ) : (
                <p className="text-center py-4 text-xs text-slate-400">No language found</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. THEME TOGGLE — ONLY ONE COMPACT ICON BUTTON */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs cursor-pointer"
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? (
          <Moon className="h-4 w-4 text-slate-700 hover:text-slate-900 transition-colors" />
        ) : (
          <Sun className="h-4 w-4 text-amber-400 hover:text-amber-300 transition-colors" />
        )}
      </button>
    </div>
  );
}
