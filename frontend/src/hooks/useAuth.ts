'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const { isAuthenticated, user, fetchMe, isLoading } = useAuthStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchMe();
      hasFetched.current = true;
    }
  }, [fetchMe]);

  useEffect(() => {
    // Only redirect if loading is finished
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/login');
      } else if (!requireAuth && isAuthenticated) {
        router.push('/app');
      }
    }
  }, [isAuthenticated, isLoading, router, requireAuth]);

  return { isAuthenticated, user, isLoading };
}
