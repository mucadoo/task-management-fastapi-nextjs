import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth-service';
import { request } from '@/lib/api-client';
import { tokenManager } from '@/lib/token';

vi.mock('@/lib/api-client', () => ({
  request: vi.fn(),
}));

vi.mock('@/lib/token', () => ({
  tokenManager: {
    setTokens: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('calls request with correct parameters and sets tokens', async () => {
      const mockResponse = {
        access_token: 'access-123',
        refresh_token: 'refresh-123',
        token_type: 'bearer',
      };
      vi.mocked(request).mockResolvedValue(mockResponse);

      const loginData = { identifier: 'testuser', password: 'password123' };
      const result = await authService.login(loginData);

      expect(request).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            identifier: 'testuser',
            password: 'password123',
          }),
        }),
      );
      expect(tokenManager.setTokens).toHaveBeenCalledWith('access-123', 'refresh-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('register', () => {
    it('calls request with correct parameters and does not set tokens automatically', async () => {
      const mockResponse = {
        access_token: 'access-reg',
        refresh_token: 'refresh-reg',
        token_type: 'bearer',
      };
      vi.mocked(request).mockResolvedValue(mockResponse);

      const regData = {
        name: 'Test Name',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      const result = await authService.register(regData);

      expect(request).toHaveBeenCalledWith(
        '/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(regData),
        }),
      );
      expect(tokenManager.setTokens).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMe', () => {
    it('calls request for /auth/me', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test' };
      vi.mocked(request).mockResolvedValue(mockUser);

      const result = await authService.getMe();

      expect(request).toHaveBeenCalledWith('/auth/me', expect.anything());
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('clears tokens', () => {
      authService.logout();
      expect(tokenManager.clearTokens).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('checks tokenManager status', () => {
      vi.mocked(tokenManager.isAuthenticated).mockReturnValue(true);
      expect(authService.isAuthenticated()).toBe(true);
      expect(tokenManager.isAuthenticated).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('calls request for /auth/refresh and sets tokens', async () => {
      const mockResponse = {
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        token_type: 'bearer',
      };
      vi.mocked(request).mockResolvedValue(mockResponse);

      const result = await authService.refresh('old-refresh');

      expect(request).toHaveBeenCalledWith(
        '/auth/refresh',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refresh_token: 'old-refresh' }),
          skipRefresh: true,
        }),
      );
      expect(tokenManager.setTokens).toHaveBeenCalledWith('new-access', 'new-refresh');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateMe', () => {
    it('calls request for /auth/me with PATCH', async () => {
      const updateData = { name: 'New Name' };
      const mockUser = { id: 1, email: 'test@example.com', name: 'New Name' };
      vi.mocked(request).mockResolvedValue(mockUser);

      const result = await authService.updateMe(updateData);

      expect(request).toHaveBeenCalledWith(
        '/auth/me',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }),
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('checkUsername', () => {
    it('calls request for /auth/check-username', async () => {
      vi.mocked(request).mockResolvedValue({ available: true });

      const result = await authService.checkUsername('newuser');

      expect(request).toHaveBeenCalledWith(
        '/auth/check-username',
        expect.objectContaining({
          params: { username: 'newuser' },
        }),
      );
      expect(result).toEqual({ available: true });
    });
  });

  describe('checkEmail', () => {
    it('calls request for /auth/check-email', async () => {
      vi.mocked(request).mockResolvedValue({ available: false });

      const result = await authService.checkEmail('test@example.com');

      expect(request).toHaveBeenCalledWith(
        '/auth/check-email',
        expect.objectContaining({
          params: { email: 'test@example.com' },
        }),
      );
      expect(result).toEqual({ available: false });
    });
  });
});
