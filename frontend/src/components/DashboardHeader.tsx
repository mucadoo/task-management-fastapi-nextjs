'use client';
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { CheckSquare as CheckSquareIcon } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import ProfileModal from './ProfileModal';

interface DashboardHeaderProps {
  totalTasks: number;
  onProfileOpen: (tab: 'personal' | 'security') => void;
  isProfileOpen: boolean;
  onProfileClose: () => void;
  profileTab: 'personal' | 'security';
}

export default function DashboardHeader({
  totalTasks,
  onProfileOpen,
  isProfileOpen,
  onProfileClose,
  profileTab,
}: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-warm-200 dark:border-white/5 h-14 flex items-center px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mr-6">
        <div className="p-1.5 bg-brand-500 rounded">
          <CheckSquareIcon className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-sm text-warm-900 dark:text-gray-100">{t('common.app_name')}</span>
        <span className="mx-2 text-warm-200 dark:text-white/10">·</span>
        <span className="text-xs text-warm-600 dark:text-gray-500">
          <Trans 
            i18nKey="tasks.tasks_count" 
            values={{ count: totalTasks }}
            components={{ 
              bold: <span className="font-bold text-warm-900 dark:text-gray-100" /> 
            }} 
          />
        </span>
      </div>
      <div className="flex-grow" />
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
        <div className="w-px h-4 bg-warm-200 dark:bg-white/10 mx-1" />
        <UserMenu onProfileOpen={onProfileOpen} />
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={onProfileClose}
        initialTab={profileTab}
      />
    </div>
  );
}
