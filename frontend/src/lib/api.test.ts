import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, ApiError } from './api';
global.fetch = vi.fn();
describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  describe('getTasks', () => {
    it('fetches tasks with correct query parameters', async () => {
      const mockResponse = { items: [], total: 0, page: 1, size: 10, pages: 0 };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      const result = await api.getTasks({ status: 'pending', q: 'test' });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/?status=pending&q=test'),
        expect.any(Object),
      );
      expect(result).toEqual(mockResponse);
    });
    it('throws ApiError on non-ok response', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Not Found' }),
      });
      await expect(api.getTasks()).rejects.toThrow(ApiError);
    });
  });
  describe('tasks', () => {
    it('creates a task', async () => {
      const mockTask = { id: '1', title: 'New' };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockTask,
      });
      const result = await api.createTask({ title: 'New', status: 'pending', priority: 'medium' });
      expect(result).toEqual(mockTask);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
    it('updates a task', async () => {
      const mockTask = { id: '1', title: 'Updated' };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockTask,
      });
      const result = await api.updateTask('1', { title: 'Updated' });
      expect(result).toEqual(mockTask);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1'),
        expect.objectContaining({ method: 'PUT' }),
      );
    });
    it('deletes a task', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      });
      await api.deleteTask('1');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
    it('toggles task status', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', status: 'completed' }),
      });
      await api.toggleTaskStatus('1');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1/toggle'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
  describe('auth', () => {
    it('stores tokens on login', async () => {
      const mockTokens = { access_token: 'access', refresh_token: 'refresh', token_type: 'bearer' };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockTokens,
      });
      await api.login({ identifier: 'test@example.com', password: 'password' });
      expect(localStorage.getItem('token')).toBe('access');
      expect(localStorage.getItem('refresh_token')).toBe('refresh');
    });
    it('stores tokens on register', async () => {
      const mockTokens = {
        access_token: 'access_reg',
        refresh_token: 'refresh_reg',
        token_type: 'bearer',
      };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockTokens,
      });
      await api.register({ email: 'new@example.com', password: 'password', name: 'New' });
      expect(localStorage.getItem('token')).toBe('access_reg');
    });
    it('clears tokens on logout', () => {
      localStorage.setItem('token', 'some-token');
      api.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });
    it('returns authentication status', () => {
      expect(api.isAuthenticated()).toBe(false);
      localStorage.setItem('token', 'some-token');
      expect(api.isAuthenticated()).toBe(true);
    });
    it('fetches current user', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });
      const result = await api.getMe('manual-token');
      expect(result).toEqual(mockUser);
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer manual-token',
          }),
        }),
      );
    });
    it('retries request on 401 with refresh token', async () => {
      localStorage.setItem('refresh_token', 'refresh');
      const mockTokens = { access_token: 'new_access', refresh_token: 'new_refresh' };
      const mockUser = { id: '1' };
      (fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ detail: 'Unauthorized' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokens,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        });
      const result = await api.getMe();
      expect(result).toEqual(mockUser);
      expect(localStorage.getItem('token')).toBe('new_access');
      expect(fetch).toHaveBeenCalledTimes(3);
    });
    it('updates current user', async () => {
      const mockUser = { id: '1', email: 'updated@example.com' };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });
      const result = await api.updateMe({ email: 'updated@example.com' });
      expect(result).toEqual(mockUser);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({ method: 'PATCH' }),
      );
    });
  });
  describe('checkUsername', () => {
    it('calls correct endpoint', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
      });
      const result = await api.checkUsername('newuser');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/check-username?username=newuser'),
        expect.any(Object),
      );
      expect(result.available).toBe(true);
    });
  });
});
