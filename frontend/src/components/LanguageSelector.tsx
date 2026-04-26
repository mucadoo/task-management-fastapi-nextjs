'use client';

import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/Tooltip';

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'pt' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleLanguage}
          className="h-9 px-2.5 rounded-lg border border-warm-200 dark:border-warm-700 hover:bg-warm-100 dark:hover:bg-warm-900 text-xs font-bold tracking-widest uppercase text-warm-700 dark:text-warm-300 focus:outline-none focus:ring-2 focus:ring-brand-700/20 transition-all duration-150 shadow-sm cursor-pointer"
          aria-label="Toggle language"
        >
          {i18n.language.startsWith('en') ? 'PT' : 'EN'}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {i18n.language.startsWith('en') ? t('common.switch_portuguese') : t('common.switch_english')}
      </TooltipContent>
    </Tooltip>
  );
}
