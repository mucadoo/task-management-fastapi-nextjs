import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';
import { useAuthStore } from '@/store/useAuthStore';

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls fetchMe on mount', () => {
    const fetchMe = vi.fn();
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      fetchMe,
      isLoading: false,
      isInitializing: false,
    });

    renderHook(() => useAuth());

    expect(fetchMe).toHaveBeenCalledTimes(1);
  });

  it('returns auth state correctly', () => {
    const mockUser = { id: 1, name: 'Test' };
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      fetchMe: vi.fn(),
      isLoading: false,
      isInitializing: true,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(true);
  });
});
