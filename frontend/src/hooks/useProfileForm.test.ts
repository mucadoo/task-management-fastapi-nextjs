import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProfileForm } from './useProfileForm';
import { useAuthStore } from '@/store/useAuthStore';

class MockApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
vi.stubGlobal('ApiError', MockApiError);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/services/auth-service', () => ({
  authService: {
    checkUsername: vi.fn(),
    checkEmail: vi.fn(),
  },
}));

vi.mock('use-debounce', () => ({
  useDebounce: (value: any) => [value],
}));

describe('useProfileForm', () => {
  const mockUpdateMe = vi.fn();
  const mockUser = { name: 'Old Name', email: 'old@example.com', username: 'olduser' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      updateMe: mockUpdateMe,
    });
  });

  it('initializes with user data', () => {
    const { result } = renderHook(() => useProfileForm({ activeTab: 'personal', isOpen: true }));
    expect(result.current.form.getValues().name).toBe('Old Name');
    expect(result.current.form.getValues().email).toBe('old@example.com');
  });

  it('calls updateMe on submit for personal tab', async () => {
    const { result } = renderHook(() => useProfileForm({ activeTab: 'personal', isOpen: true }));

    act(() => {
      result.current.form.setValue('name', 'New Name');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockUpdateMe).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Name',
      }),
    );
  });

  it('handles updateMe error for personal tab', async () => {
    mockUpdateMe.mockRejectedValue(new Error('Update failed'));
    const { result } = renderHook(() => useProfileForm({ activeTab: 'personal', isOpen: true }));

    await act(async () => {
      try {
        await result.current.onSubmit();
      } catch (e) {
        // Expected
      }
    });

    expect(mockUpdateMe).toHaveBeenCalled();
  });

  it('calls updateMe on submit for security tab', async () => {
    const { result } = renderHook(() => useProfileForm({ activeTab: 'security', isOpen: true }));

    act(() => {
      result.current.form.setValue('current_password', 'OldPass123!');
      result.current.form.setValue('password', 'NewPass123!');
      result.current.form.setValue('confirmPassword', 'NewPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockUpdateMe).toHaveBeenCalledWith(
      expect.objectContaining({
        current_password: 'OldPass123!',
        password: 'NewPass123!',
      }),
    );
  });
});
