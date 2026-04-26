'use client';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import { Languages } from 'lucide-react';
import { TooltipSimple } from './ui/Tooltip';
export default function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const languages = [
    { code: 'en', name: t('common.english'), label: 'EN' },
    { code: 'pt', name: t('common.portuguese'), label: 'PT' },
  ];
  const currentLanguage =
    languages.find((lang) => i18n.language.startsWith(lang.code)) || languages[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-9 px-2.5 flex items-center gap-2 rounded-lg border border-warm-200 dark:border-white/10 hover:bg-warm-100 dark:hover:bg-white/5 text-xs font-bold tracking-widest uppercase text-warm-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all duration-150 shadow-sm cursor-pointer"
          aria-label={t('common.select_language')}
        >
          <Languages className="h-4 w-4" />
          <span>{currentLanguage.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={
              i18n.language.startsWith(lang.code) ? 'bg-warm-50 dark:bg-white/5 font-semibold' : ''
            }
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
