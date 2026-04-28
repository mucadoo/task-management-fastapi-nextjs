import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProfileForm } from './useProfileForm';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth-service';

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
    } as any);
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

    expect(mockUpdateMe).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Name',
    }));
  });

  it('checks username availability when changed', async () => {
    vi.mocked(authService.checkUsername).mockResolvedValue({ available: true });

    const { result } = renderHook(() => useProfileForm({ activeTab: 'personal', isOpen: true }));

    await act(async () => {
      result.current.form.setValue('username', 'newuser');
    });

    expect(authService.checkUsername).toHaveBeenCalledWith('newuser');
  });
});