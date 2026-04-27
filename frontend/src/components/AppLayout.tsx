'use client';
import React from 'react';
import DashboardHeader from './DashboardHeader';
import ProfileModal from './ProfileModal';

interface AppLayoutProps {
  children: React.ReactNode;
  totalTasks: number;
  onProfileOpen: (tab: 'personal' | 'security') => void;
  isProfileOpen: boolean;
  onProfileClose: () => void;
  profileTab: 'personal' | 'security';
}

export function AppLayout({
  children,
  totalTasks,
  onProfileOpen,
  isProfileOpen,
  onProfileClose,
  profileTab,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-[#0a0a0a]">
      <DashboardHeader totalTasks={totalTasks} onProfileOpen={onProfileOpen} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">{children}</main>

      {/* ProfileModal is rendered here at the root level of the app layout to avoid stacking context issues from sticky headers */}
      <ProfileModal isOpen={isProfileOpen} onClose={onProfileClose} initialTab={profileTab} />
    </div>
  );
}
