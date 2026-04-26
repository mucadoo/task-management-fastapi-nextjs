import { request } from '@/lib/api-client';
import { tokenManager } from '@/lib/token';
import { 
  TokenResponse, 
  User, 
  LoginData, 
  RegisterData, 
  UpdateMeData 
} from '@/types/auth';

export const authService = {
  login: async (data: LoginData) => {
    const res = await request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    tokenManager.setTokens(res.access_token, res.refresh_token);
    return res;
  },

  register: async (data: RegisterData) => {
    const res = await request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    tokenManager.setTokens(res.access_token, res.refresh_token);
    return res;
  },

  refresh: async (refreshToken: string) => {
    const res = await request<TokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
      skipRefresh: true,
    });
    tokenManager.setTokens(res.access_token, res.refresh_token);
    return res;
  },

  getMe: (token?: string) => request<User>('/auth/me', { token }),

  updateMe: (data: UpdateMeData) =>
    request<User>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  checkUsername: (username: string) =>
    request<{ available: boolean }>('/auth/check-username', {
      params: { username },
    }),

  checkEmail: (email: string) =>
    request<{ available: boolean }>('/auth/check-email', {
      params: { email },
    }),

  logout: () => {
    tokenManager.clearTokens();
  },

  isAuthenticated: () => tokenManager.isAuthenticated(),
};
