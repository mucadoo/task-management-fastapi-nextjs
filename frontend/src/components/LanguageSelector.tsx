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
      className="flex items-center justify-center p-2.5 w-10 h-10 rounded-xl bg-warm-100 dark:bg-warm-800 hover:bg-warm-200 dark:hover:bg-warm-700 text-sm font-bold text-warm-700 dark:text-warm-300 focus:outline-none focus:ring-2 focus:ring-brand-600/30 transition-all duration-150 shadow-sm"
      aria-label="Toggle language"
    >
      {i18n.language.startsWith('en') ? 'PT' : 'EN'}
    </button>
  );
}
