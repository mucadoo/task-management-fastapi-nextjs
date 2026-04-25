export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  created_at: string;
}
export interface TaskCreate {
  title: string;
  description?: string;
  status?: TaskStatus;
}
export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
