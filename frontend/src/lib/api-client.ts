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
  params?: Record<string, unknown>;
  skipRefresh?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

function onTokenRefreshed(error: unknown, token: string | null) {
  refreshSubscribers.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  refreshSubscribers = [];
}

async function getResponseData(response: Response): Promise<unknown> {
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
        const stringValue =
          typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
            ? String(value)
            : JSON.stringify(value);
        searchParams.append(key, stringValue);
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
      ...(options?.headers as Record<string, string>),
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
          onTokenRefreshed(null, tokenRes.access_token);
        } catch (error) {
          isRefreshing = false;
          authService.logout();
          onTokenRefreshed(error, null);
          throw error;
        }
      }

      return new Promise<T>((resolve, reject) => {
        refreshSubscribers.push({
          resolve: (newToken) => {
            void (async () => {
              try {
                const retryResponse = await fetch(url, {
                  ...options,
                  headers: getHeaders(newToken),
                });
                if (retryResponse.ok) {
                  resolve((await getResponseData(retryResponse)) as T);
                } else {
                  reject(new ApiError(retryResponse.status, i18n.t('errors.retry_failed')));
                }
              } catch (e) {
                reject(e instanceof Error ? e : new Error(String(e)));
              }
            })();
          },
          reject: (err) => reject(err instanceof Error ? err : new Error(String(err))),
        });
      });
    }
  }

  if (!response.ok) {
    let message = i18n.t('common.error');
    try {
      const errorData = (await response.json()) as { error?: string; detail?: string };
      const rawMessage = errorData.error || errorData.detail || message;
      message = typeof rawMessage === 'string' ? i18n.t(rawMessage) : i18n.t('common.error');
    } catch {
      // Ignore error data parsing failure
    }
    throw new ApiError(response.status, message);
  }

  return getResponseData(response) as Promise<T>;
}
