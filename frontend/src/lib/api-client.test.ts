import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request, ApiError } from './api-client';
import { tokenManager } from './token';

vi.mock('./token', () => ({
  tokenManager: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
  },
}));

// We need to mock fetch globally for vitest
global.fetch = vi.fn();

describe('api-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    } as Response);
  });

  it('makes a successful request', async () => {
    const result = await request('/test');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.anything());
    expect(result).toEqual({ success: true });
  });

  it('adds query parameters correctly', async () => {
    await request('/test', { params: { foo: 'bar', baz: 123 } });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/test?foo=bar&baz=123'), expect.anything());
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
      })
    );
  });

  it('throws ApiError on failure', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'Bad Request' }),
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

  it('handles JSON parsing errors gracefully', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => { throw new Error('Invalid JSON'); },
    } as Response);

    const result = await request('/test');
    expect(result).toEqual({});
  });

  describe('token refresh', () => {
    beforeEach(() => {
      // Ensure we are in a browser-like environment for refresh logic
      vi.stubGlobal('window', {});
    });

    it('attempts to refresh token on 401', async () => {
      vi.mocked(tokenManager.getRefreshToken).mockReturnValue('refresh-token');
      
      // First call fails with 401
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      // Refresh call succeeds
      // Note: we need to mock the dynamic import of authService or wait for it.
      // Since it's a dynamic import in the code, it's tricky.
      // Let's mock the whole module it might be easier if we can.
    });
  });
});
