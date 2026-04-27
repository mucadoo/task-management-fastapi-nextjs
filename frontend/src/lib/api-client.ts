import { tokenManager } from './token';
import i18n from './i18n';

const API_BASE_URL =
  (typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL) || '/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, any>;
  skipRefresh?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function getResponseData(response: Response): Promise<any> {
  if (response.status === 204) return {};
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${API_BASE_URL}${normalizedPath}`;

  if (options?.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    const query = searchParams.toString();
    if (query) {
      const separator = url.includes('?') ? '&' : '?';
      url += separator + query;
    }
  }

  const getHeaders = (token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as any),
    };
    const activeToken = token || options?.token || tokenManager.getAccessToken();
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }
    return headers;
  };

  const response = await fetch(url, {
    ...options,
    headers: getHeaders(),
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
        const { authService } = await import('../services/auth-service');
        try {
          const tokenRes = await authService.refresh(refreshToken);
          isRefreshing = false;
          onTokenRefreshed(tokenRes.access_token);
        } catch (error) {
          isRefreshing = false;
          authService.logout();
          throw error;
        }
      }

      return new Promise<T>((resolve, reject) => {
        refreshSubscribers.push(async (newToken) => {
          try {
            const retryResponse = await fetch(url, {
              ...options,
              headers: getHeaders(newToken),
            });
            if (retryResponse.ok) {
              resolve(await getResponseData(retryResponse));
            } else {
              reject(new ApiError(retryResponse.status, i18n.t('errors.retry_failed')));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
    }
  }

  if (!response.ok) {
    let message = i18n.t('common.error');
    try {
      const errorData = await response.json();
      const rawMessage = errorData.error || errorData.detail || message;
      message = typeof rawMessage === 'string' ? i18n.t(rawMessage) : i18n.t('common.error');
    } catch {}
    throw new ApiError(response.status, message);
  }

  return getResponseData(response);
}
