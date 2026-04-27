'use client';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuth() {
  const { isAuthenticated, user, fetchMe, isLoading, isInitializing } = useAuthStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchMe();
      hasFetched.current = true;
    }
  }, [fetchMe]);

  return {
    isAuthenticated,
    user,
    isLoading: isInitializing, 
    isActionLoading: isLoading,
  };
}
