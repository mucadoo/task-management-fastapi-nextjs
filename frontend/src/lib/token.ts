export const tokenManager = {
  getAccessToken: () => {
    if (typeof window === 'undefined') return null;
    // Handle migration from 'token' to 'access_token' if necessary,
    // or just use 'token' if that's what was used before.
    // Based on the request, we should use 'token' to match existing sessions.
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  },
  getRefreshToken: () =>
    typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null,
  setTokens: (access: string, refresh: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', access);
    localStorage.setItem('access_token', access); // set both during transition
    localStorage.setItem('refresh_token', refresh);
  },
  clearTokens: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};
