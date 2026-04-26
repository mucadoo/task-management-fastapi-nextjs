"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskBoard from '../../components/TaskBoard';
import { useAuthStore } from '../../store/useAuthStore';

export default function AppDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, fetchMe, isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-primary/20 rounded-full" />
          <p className="text-sm text-muted-foreground font-medium">Authenticating...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <TaskBoard />
    </main>
  );
}
