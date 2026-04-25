'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';
import { ThemeProvider } from 'next-themes';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </I18nextProvider>
  );
}
