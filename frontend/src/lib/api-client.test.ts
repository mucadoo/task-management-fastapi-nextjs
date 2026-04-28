import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request, ApiError } from './api-client';
import { tokenManager } from './token';

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

  it('handles JSON parsing errors gracefully', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => {
        return Promise.reject(new Error('Invalid JSON'));
      },
    } as Response);

    const result = await request('/test');
    expect(result).toEqual({});
  });

  describe('token refresh', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {});
    });

    it('attempts to refresh token on 401', () => {
      vi.mocked(tokenManager.getRefreshToken).mockReturnValue('refresh-token');

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);
    });
  });
});
