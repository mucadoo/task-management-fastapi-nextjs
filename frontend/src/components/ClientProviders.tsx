'use client';
import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';
import { TooltipProvider } from '@radix-ui/react-tooltip';
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>{children}</TooltipProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}
