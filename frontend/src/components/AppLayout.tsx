'use client';
import React from 'react';
import DashboardHeader from './DashboardHeader';

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
      <DashboardHeader
        totalTasks={totalTasks}
        onProfileOpen={onProfileOpen}
        isProfileOpen={isProfileOpen}
        onProfileClose={onProfileClose}
        profileTab={profileTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
