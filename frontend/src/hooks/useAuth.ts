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
    
  }, []);

  useEffect(() => {
    
    
    
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
    isLoading: isInitializing, 
    isActionLoading: isLoading,
  };
}
