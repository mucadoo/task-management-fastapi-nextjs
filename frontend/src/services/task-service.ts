import { request } from '../lib/api-client';
import {
  PaginatedResponse,
  Task,
  TaskCreate,
  TaskUpdate,
  TaskStatus,
  TaskPriority,
} from '../types/task';

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
