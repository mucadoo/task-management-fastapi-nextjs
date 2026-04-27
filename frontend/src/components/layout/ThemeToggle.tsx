'use client';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleTheme}
          className="h-9 px-2.5 rounded-lg border border-warm-200 dark:border-warm-700 hover:bg-warm-100 dark:hover:bg-warm-900 focus:outline-none focus:ring-2 focus:ring-brand-700/20 transition-all duration-150 shadow-sm cursor-pointer"
          aria-label={t('common.toggle_theme')}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4 text-brand-500" />
          ) : (
            <Moon className="h-4 w-4 text-warm-700" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {resolvedTheme === 'dark' ? t('common.light_mode') : t('common.dark_mode')}
      </TooltipContent>
    </Tooltip>
  );
}
