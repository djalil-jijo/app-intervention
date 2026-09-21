'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('erp-theme') as 'dark' | 'light';
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle('light-theme', saved === 'light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('erp-theme', nextTheme);
    document.documentElement.classList.toggle('light-theme', nextTheme === 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 transition-all flex items-center justify-center"
      title={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-sky-400" />
      )}
    </button>
  );
};
