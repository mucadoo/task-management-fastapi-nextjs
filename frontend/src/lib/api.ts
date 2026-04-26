import {
  PaginatedResponse,
  Task,
  TaskCreate,
  TaskStatus,
  TaskUpdate,
  TaskPriority,
} from '../types/task';
import { TokenResponse, User } from '../types/auth';

const API_BASE_URL =
  (typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL) || '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper to manage tokens in one place
const tokenManager = {
  get: () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null),
  getRefresh: () => (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null),
  set: (access: string, refresh: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', access);
    localStorage.setItem('refresh_token', refresh);
    document.cookie = `token=${access}; path=/; max-age=3600; SameSite=Lax`;
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  },
};

async function request<T>(path: string, options?: RequestInit & { token?: string; params?: Record<string, any> }): Promise<T> {
  // Build URL with params if provided
  let url = `${API_BASE_URL}${path}`;
  if (options?.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    const query = searchParams.toString();
    if (query) url += `?${query}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as any,
  };

  const token = options?.token || tokenManager.get();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle Token Refresh (Industry standard 401 retry)
  if (
    response.status === 401 &&
    typeof window !== 'undefined' &&
    !path.includes('/auth/refresh') &&
    !path.includes('/auth/login')
  ) {
    const refreshToken = tokenManager.getRefresh();
    if (refreshToken) {
      try {
        const tokenRes = await api.refresh(refreshToken);
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${tokenRes.access_token}`,
          },
        });
        if (retryResponse.ok) return retryResponse.json();
      } catch {
        api.logout();
      }
    }
  }

  if (!response.ok) {
    let message = 'An error occurred';
    try {
      const errorData = await response.json();
      message = errorData.error || errorData.detail || message;
    } catch {}
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

export const api = {
  async getTasks(params?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    q?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_dir?: string;
    token?: string;
  }): Promise<PaginatedResponse<Task>> {
    const { token, ...queryParams } = params || {};
    return request<PaginatedResponse<Task>>('/tasks/', {
      token,
      params: queryParams,
    });
  },

  async getTask(id: string): Promise<Task> {
    return request<Task>(`/tasks/${id}`);
  },

  async createTask(data: TaskCreate): Promise<Task> {
    return request<Task>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(id: string, data: TaskUpdate): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async toggleTaskStatus(id: string): Promise<Task> {
    return request<Task>(`/tasks/${id}/toggle`, {
      method: 'POST',
    });
  },

  async deleteTask(id: string): Promise<void> {
    return request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  async login(data: any): Promise<TokenResponse> {
    const res = await request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    tokenManager.set(res.access_token, res.refresh_token);
    return res;
  },

  async register(data: any): Promise<TokenResponse> {
    const res = await request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    tokenManager.set(res.access_token, res.refresh_token);
    return res;
  },

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const res = await request<TokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    tokenManager.set(res.access_token, res.refresh_token);
    return res;
  },

  async getMe(token?: string): Promise<User> {
    return request<User>('/auth/me', { token });
  },

  async updateMe(data: {
    email?: string;
    name?: string;
    username?: string;
    password?: string;
    current_password?: string;
  }): Promise<User> {
    return request<User>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async checkUsername(username: string): Promise<{ available: boolean }> {
    return request<{ available: boolean }>('/auth/check-username', {
      params: { username }
    });
  },

  async checkEmail(email: string): Promise<{ available: boolean }> {
    return request<{ available: boolean }>('/auth/check-email', {
      params: { email }
    });
  },

  logout() {
    tokenManager.clear();
  },

  isAuthenticated(): boolean {
    return !!tokenManager.get();
  },
};
