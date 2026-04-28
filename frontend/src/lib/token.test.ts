import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tokenManager } from './token';

describe('tokenManager', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal('document', {
      cookie: '',
    });
    vi.stubGlobal('window', {});
  });

  it('gets access token from localStorage', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('mock-token');
    expect(tokenManager.getAccessToken()).toBe('mock-token');
  });

  it('sets tokens in localStorage and cookies', () => {
    tokenManager.setTokens('access', 'refresh');
    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'access');
    expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh');
    expect(document.cookie).toContain('token=access');
  });

  it('clears tokens', () => {
    tokenManager.clearTokens();
    expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    expect(document.cookie).toContain('expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });

  it('checks authentication status', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('token');
    expect(tokenManager.isAuthenticated()).toBe(true);

    vi.mocked(localStorage.getItem).mockReturnValue(null);
    expect(tokenManager.isAuthenticated()).toBe(false);
  });
});
