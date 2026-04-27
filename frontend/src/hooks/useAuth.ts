'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const { isAuthenticated, user, fetchMe, isLoading, isInitializing } = useAuthStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchMe();
      hasFetched.current = true;
    }
  }, [fetchMe]);

  useEffect(() => {
    // Only redirect if initialization is finished
    // We don't check 'isLoading' here because that's for login/register actions
    // and we handle those redirects manually or want to stay on the page during the process
    if (!isInitializing) {
      if (requireAuth && !isAuthenticated) {
        router.replace('/login');
      } else if (!requireAuth && isAuthenticated) {
        router.replace('/app');
      }
    }
  }, [isAuthenticated, isInitializing, router, requireAuth]);

  return {
    isAuthenticated,
    user,
    isLoading: isInitializing, // Only return true for the initial check
    isActionLoading: isLoading,
  };
}
