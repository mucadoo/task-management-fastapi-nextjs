export const tokenManager = {
  getAccessToken: () => (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null),
  getRefreshToken: () => (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null),
  setTokens: (access: string, refresh: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    // You might want to set a secure, httpOnly cookie for the refresh token in a real app
    // For simplicity, we're using localStorage for both here.
    // document.cookie = `access_token=${access}; path=/; max-age=3600; SameSite=Lax`;
  },
  clearTokens: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  },
  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};
