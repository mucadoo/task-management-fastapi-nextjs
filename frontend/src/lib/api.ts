import { PaginatedResponse, Task, TaskCreate, TaskStatus, TaskUpdate } from "../types/task";
import { TokenResponse, User } from "../types/auth";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
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
  async getTasks(params?: { status?: TaskStatus; page?: number; page_size?: number; token?: string }): Promise<PaginatedResponse<Task>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.page_size) searchParams.append("page_size", params.page_size.toString());
    const query = searchParams.toString();
    return request<PaginatedResponse<Task>>(`/tasks/${query ? `?${query}` : ""}`, { token: params?.token });
  },
  async getTask(id: number): Promise<Task> {
    return request<Task>(`/tasks/${id}`);
  },
  async createTask(data: TaskCreate): Promise<Task> {
    return request<Task>("/tasks/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  async updateTask(id: number, data: TaskUpdate): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  async deleteTask(id: number): Promise<void> {
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
      document.cookie = `token=${res.access_token}; path=/; max-age=3600; SameSite=Lax`;
    }
    return res;
  },

  async register(data: any): Promise<User> {
    return request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
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
