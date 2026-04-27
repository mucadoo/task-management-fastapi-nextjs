export const tokenManager = {
  getAccessToken: () => {
    if (typeof window === 'undefined') return null;
    
    
    
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  },
  getRefreshToken: () =>
    typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null,
  setTokens: (access: string, refresh: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', access);
    localStorage.setItem('access_token', access); 
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
