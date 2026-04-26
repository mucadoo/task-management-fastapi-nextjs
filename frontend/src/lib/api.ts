import { PaginatedResponse, Task, TaskCreate, TaskStatus, TaskUpdate, TaskPriority } from "../types/task";
import { TokenResponse, User } from "../types/auth";

const API_BASE_URL = (typeof window === "undefined" 
  ? process.env.INTERNAL_API_URL 
  : process.env.NEXT_PUBLIC_API_URL) || "/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function getAuthHeader(token?: string): Record<string, string> {
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  if (typeof window !== "undefined") {
    const localToken = localStorage.getItem("token");
    if (localToken) {
      return { Authorization: `Bearer ${localToken}` };
    }
  }
  return {};
}

async function request<T>(path: string, options?: RequestInit & { token?: string }): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(options?.token),
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== "undefined" && !path.includes("/auth/refresh") && !path.includes("/auth/login") && !path.includes("/auth/register")) {
    const refreshToken = localStorage.getItem("refresh_token");
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
        if (retryResponse.ok) {
          return retryResponse.json();
        }
      } catch {
        api.logout();
      }
    }
  }

  if (!response.ok) {
    let message = "An error occurred";
    try {
      const errorData = await response.json();
      message = errorData.error || errorData.detail || message;
    } catch {
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  async getTasks(params?: { status?: TaskStatus; priority?: TaskPriority; q?: string; page?: number; page_size?: number; token?: string }): Promise<PaginatedResponse<Task>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.priority) searchParams.append("priority", params.priority);
    if (params?.q) searchParams.append("q", params.q);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.page_size) searchParams.append("page_size", params.page_size.toString());
    const query = searchParams.toString();
    return request<PaginatedResponse<Task>>(`/tasks/${query ? `?${query}` : ""}`, { token: params?.token });
  },

  async getTask(id: string): Promise<Task> {
    return request<Task>(`/tasks/${id}`);
  },

  async createTask(data: TaskCreate): Promise<Task> {
    return request<Task>("/tasks/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateTask(id: string, data: TaskUpdate): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async toggleTaskStatus(id: string): Promise<Task> {
    return request<Task>(`/tasks/${id}/toggle`, {
      method: "POST",
    });
  },

  async deleteTask(id: string): Promise<void> {
    return request<void>(`/tasks/${id}`, {
      method: "DELETE",
    });
  },

  async login(data: any): Promise<TokenResponse> {
    const res = await request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      document.cookie = `token=${res.access_token}; path=/; max-age=3600; SameSite=Lax`;
    }
    return res;
  },

  async register(data: any): Promise<TokenResponse> {
    const res = await request<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      document.cookie = `token=${res.access_token}; path=/; max-age=3600; SameSite=Lax`;
    }
    return res;
  },

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const res = await request<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      document.cookie = `token=${res.access_token}; path=/; max-age=3600; SameSite=Lax`;
    }
    return res;
  },

  async getMe(token?: string): Promise<User> {
    return request<User>("/auth/me", { token });
  },

  async updateMe(data: { email?: string; name?: string; username?: string; password?: string }): Promise<User> {
    return request<User>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async checkUsername(username: string): Promise<{ available: boolean }> {
    return request<{ available: boolean }>(`/auth/check-username?username=${encodeURIComponent(username)}`);
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  },

  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token");
    }
    return false;
  },
};
