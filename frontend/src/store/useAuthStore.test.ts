import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { authService } from '@/services/auth-service';
import { tokenManager } from '@/lib/token';
import { notify } from '@/lib/notifications';

vi.mock('@/services/auth-service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
    logout: vi.fn(),
    updateMe: vi.fn(),
  },
}));

vi.mock('@/lib/token', () => ({
  tokenManager: {
    isAuthenticated: vi.fn(),
  },
}));

vi.mock('@/lib/notifications', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
      error: null,
    });
  });

  it('sets user correctly', () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test' };
    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  describe('login', () => {
    it('handles successful login', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test' };
      vi.mocked(authService.login).mockResolvedValue({
        access_token: 'at',
        refresh_token: 'rt',
        token_type: 'bearer',
      });
      vi.mocked(authService.getMe).mockResolvedValue(mockUser);

      await useAuthStore.getState().login({ identifier: 'user', password: 'pass' });

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('handles login failure', async () => {
      const error = new Error('Invalid credentials');
      vi.mocked(authService.login).mockRejectedValue(error);

      await expect(
        useAuthStore.getState().login({ identifier: 'user', password: 'pass' }),
      ).rejects.toThrow('Invalid credentials');

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toBe('Invalid credentials');
      expect(notify.error).toHaveBeenCalledWith(error, 'auth.login_failed');
    });
  });

  describe('register', () => {
    it('handles successful registration', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test' };
      vi.mocked(authService.register).mockResolvedValue({
        access_token: 'at',
        refresh_token: 'rt',
        token_type: 'bearer',
      });
      vi.mocked(authService.getMe).mockResolvedValue(mockUser);

      await useAuthStore.getState().register({
        name: 'Test',
        username: 'test',
        email: 'test@example.com',
        password: 'pass',
        confirmPassword: 'pass',
      });

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(notify.success).toHaveBeenCalledWith('auth.register_success');
    });

    it('handles register failure', async () => {
      const error = new Error('Already exists');
      vi.mocked(authService.register).mockRejectedValue(error);

      await expect(
        useAuthStore.getState().register({
          name: 'Test',
          username: 'test',
          email: 'test@example.com',
          password: 'pass',
          confirmPassword: 'pass',
        }),
      ).rejects.toThrow('Already exists');

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(notify.error).toHaveBeenCalledWith(error, 'auth.register_failed');
    });
  });

  describe('logout', () => {
    it('clears state on logout', () => {
      useAuthStore.setState({ user: { id: 1 } as any, isAuthenticated: true });
      useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('fetchMe', () => {
    it('does nothing if not authenticated', async () => {
      vi.mocked(tokenManager.isAuthenticated).mockReturnValue(false);
      await useAuthStore.getState().fetchMe();
      expect(authService.getMe).not.toHaveBeenCalled();
    });

    it('fetches user if authenticated and no user in state', async () => {
      const mockUser = { id: 1, name: 'Test' } as any;
      vi.mocked(tokenManager.isAuthenticated).mockReturnValue(true);
      vi.mocked(authService.getMe).mockResolvedValue(mockUser);

      await useAuthStore.getState().fetchMe();

      expect(authService.getMe).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('handles fetchMe failure by logging out', async () => {
      vi.mocked(tokenManager.isAuthenticated).mockReturnValue(true);
      vi.mocked(authService.getMe).mockRejectedValue(new Error('Auth expired'));

      await useAuthStore.getState().fetchMe();

      expect(authService.logout).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('updateMe', () => {
    it('updates user in state on success', async () => {
      const updatedUser = { id: 1, name: 'New Name' } as any;
      vi.mocked(authService.updateMe).mockResolvedValue(updatedUser);

      await useAuthStore.getState().updateMe({ name: 'New Name' });

      expect(useAuthStore.getState().user).toEqual(updatedUser);
    });

    it('handles updateMe failure', async () => {
      const error = new Error('Update failed');
      vi.mocked(authService.updateMe).mockRejectedValue(error);

      await expect(useAuthStore.getState().updateMe({ name: 'New Name' })).rejects.toThrow(
        'Update failed',
      );

      expect(useAuthStore.getState().error).toBe('Update failed');
    });
  });
});
