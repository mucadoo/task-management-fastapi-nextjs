'use client';

import TaskBoard from '@/components/tasks/TaskBoard';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Suspense, useEffect } from 'react';
import Loading from './loading';
import { useRouter } from 'next/navigation';

export default function AppDashboardPage() {
  const { t } = useTranslation();
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-primary/20 rounded-full" />
          <p className="text-sm text-muted-foreground font-medium">{t('common.authenticating')}</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <Suspense fallback={<Loading />}>
        <TaskBoard />
      </Suspense>
    </main>
  );
}
