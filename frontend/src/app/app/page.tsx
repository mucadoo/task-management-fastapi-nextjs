"use client";

import TaskBoard from '../../components/TaskBoard';
import { useAuth } from '../../hooks/useAuth';

export default function AppDashboardPage() {
  const { isLoading, isAuthenticated } = useAuth(true);

  if (isLoading || !isAuthenticated) {
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
