'use client';

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'pt' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="h-9 px-2.5 rounded-lg border border-warm-200 dark:border-warm-700 hover:bg-warm-100 dark:hover:bg-warm-900 text-xs font-bold tracking-widest uppercase text-warm-700 dark:text-warm-300 focus:outline-none focus:ring-2 focus:ring-brand-700/20 transition-all duration-150 shadow-sm"
      aria-label="Toggle language"
    >
      {i18n.language.startsWith('en') ? 'PT' : 'EN'}
    </button>
  );
}
