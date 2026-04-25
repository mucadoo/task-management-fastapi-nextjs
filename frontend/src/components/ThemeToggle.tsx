'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-2.5 w-10 h-10" />;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 hover:bg-warm-200 dark:hover:bg-warm-700 focus:outline-none focus:ring-2 focus:ring-brand-600/30 transition-all duration-150 shadow-sm group"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-400 fill-amber-400/20 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 text-warm-700 fill-warm-700/10 transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
}
