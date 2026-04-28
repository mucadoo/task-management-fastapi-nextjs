import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request, ApiError } from './api-client';
import { tokenManager } from './token';

const mockAuthService = {
  refresh: vi.fn(),
  logout: vi.fn(),
};

vi.mock('../services/auth-service', () => ({
  authService: mockAuthService,
}));

vi.mock('./token', () => ({
  tokenManager: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
  },
}));

global.fetch = vi.fn();

describe('api-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    } as Response);
  });

  it('makes a successful request', async () => {
    const result = await request('/test');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.anything());
    expect(result).toEqual({ success: true });
  });

  it('adds query parameters correctly', async () => {
    await request('/test', { params: { foo: 'bar', baz: 123 } });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test?foo=bar&baz=123'),
      expect.anything(),
    );
  });

  it('adds authorization header if token exists', async () => {
    vi.mocked(tokenManager.getAccessToken).mockReturnValue('mock-token');
    await request('/test');
    expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      }),
    );
  });

  it('throws ApiError on failure', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: 'Bad Request' }),
    } as Response);

    await expect(request('/test')).rejects.toThrow(ApiError);
  });

  it('handles 204 No Content correctly', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 204,
    } as Response);

    const result = await request('/test');
    expect(result).toEqual({});
  });

  it('handles error response without JSON payload', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('Syntax Error')),
    } as Response);

    await expect(request('/test')).rejects.toThrow(ApiError);
  });

  it('handles various query parameter types', async () => {
    await request('/test', {
      params: {
        str: 'hello',
        num: 1,
        bool: true,
        nil: null,
        undef: undefined,
        obj: { a: 1 },
      },
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('str=hello&num=1&bool=true&obj=%7B%22a%22%3A1%7D'),
      expect.anything(),
    );
  });

  describe('token refresh', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {});
    });

    it('attempts to refresh token on 401', async () => {
      vi.mocked(tokenManager.getRefreshToken).mockReturnValue('refresh-token');

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: 'Unauthorized' }),
      } as Response);

      mockAuthService.refresh.mockResolvedValue({ access_token: 'new-token' });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const result = await request('/test');

      expect(result).toEqual({ success: true });
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(mockAuthService.refresh).toHaveBeenCalledWith('refresh-token');
    });

    it('logs out on refresh failure', async () => {
      vi.mocked(tokenManager.getRefreshToken).mockReturnValue('refresh-token');

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: 'Unauthorized' }),
      } as Response);

      mockAuthService.refresh.mockRejectedValue(new Error('Refresh failed'));

      await expect(request('/test')).rejects.toThrow();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });
});
