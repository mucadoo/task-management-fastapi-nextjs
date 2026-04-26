'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';

export default function AuthSidebar() {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex lg:w-5/12 bg-brand-600 dark:bg-brand-900 p-12 flex-col justify-between relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative z-10">
        <div className="w-10 h-10 bg-white rounded flex items-center justify-center mb-6">
          <BookOpen className="text-brand-600 h-6 w-6" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">TaskFlow</h1>
        <p className="text-white/80">{t('auth.slogan')}</p>
      </div>
      <div className="relative z-10 text-white/60 text-sm">
        © {new Date().getFullYear()} {t('common.copyright')}
      </div>
    </div>
  );
}
