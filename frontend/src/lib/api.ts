import {
  PaginatedResponse,
  Task,
  TaskCreate,
  TaskUpdate,
  TaskStatus,
  TaskPriority,
} from '../types/task';
import { TokenResponse, User } from '../types/auth';
import { tokenManager } from './token';

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

interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, any>;
  skipRefresh?: boolean;
}

// A simple lock to prevent multiple refresh calls at once
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function request<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
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
    ...(options?.headers as any),
  };

  const token = options?.token || tokenManager.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle Token Refresh
  if (
    response.status === 401 &&
    !options?.skipRefresh &&
    typeof window !== 'undefined' &&
    !path.includes('/auth/refresh') &&
    !path.includes('/auth/login')
  ) {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const tokenRes = await api.refresh(refreshToken);
          isRefreshing = false;
          onTokenRefreshed(tokenRes.access_token);
        } catch (error) {
          isRefreshing = false;
          api.logout();
          throw error;
        }
      }

      // Wait for the new token
      return new Promise<T>((resolve, reject) => {
        refreshSubscribers.push(async (newToken) => {
          try {
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                ...headers,
                Authorization: `Bearer ${newToken}`,
              },
            });
            if (retryResponse.ok) {
              resolve(retryResponse.json());
            } else {
              reject(new ApiError(retryResponse.status, 'Retry failed after refresh'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
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

/**
 * Task related API calls
 */
export const taskService = {
  getTasks: (params?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    q?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_dir?: string;
    token?: string;
  }) => {
    const { token, ...queryParams } = params || {};
    return request<PaginatedResponse<Task>>('/tasks/', {
      token,
      params: queryParams,
    });
  },

  getTask: (id: string) => request<Task>(`/tasks/${id}`),

  createTask: (data: TaskCreate) =>
    request<Task>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (id: string, data: TaskUpdate) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  toggleTaskStatus: (id: string) =>
    request<Task>(`/tasks/${id}/toggle`, {
      method: 'POST',
    }),

  deleteTask: (id: string) =>
    request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Auth related API calls
 */
export const authService = {
  login: async (data: any) => {
    const res = await request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    tokenManager.setTokens(res.access_token, res.refresh_token);
    return res;
  },

  register: async (data: any) => {
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

  updateMe: (data: {
    email?: string;
    name?: string;
    username?: string;
    password?: string;
    current_password?: string;
  }) =>
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
};

// Maintain the `api` object for backward compatibility
export const api = {
  ...taskService,
  ...authService,
  isAuthenticated: tokenManager.isAuthenticated,
};
