import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useUpdateTaskStatus,
  useDeleteTask,
} from './useTasks';
import { taskService } from '@/services/task-service';
import { notify } from '@/lib/notifications';
import { ReactNode } from 'react';

vi.mock('@/services/task-service', () => ({
  taskService: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    updateTaskStatus: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

vi.mock('@/lib/notifications', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/lib/query-utils', () => ({
  onMutateListUpdate: vi.fn(() => ({ previousQueries: [] })),
  rollbackQueries: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('fetches tasks correctly', async () => {
    const mockTasks = {
      items: [{ id: '1', title: 'Task 1' }],
      total: 1,
      page: 1,
      page_size: 12,
    };
    vi.mocked(taskService.getTasks).mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTasks({}), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0]).toEqual(mockTasks);
    expect(taskService.getTasks).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it('handles getNextPageParam correctly', async () => {
    const page1 = { items: [], total: 24, page: 1, page_size: 12 };
    vi.mocked(taskService.getTasks).mockResolvedValueOnce(page1);

    const { result } = renderHook(() => useTasks({}), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    const page2 = { items: [], total: 24, page: 2, page_size: 12 };
    vi.mocked(taskService.getTasks).mockResolvedValueOnce(page2);

    await result.current.fetchNextPage();
    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('creates a task successfully', async () => {
    const newTask = { title: 'New Task', status: 'pending', priority: 'medium' };
    vi.mocked(taskService.createTask).mockResolvedValue({ id: '1', ...newTask } as any);

    const { result } = renderHook(() => useCreateTask(), { wrapper });

    result.current.mutate(newTask as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notify.success).toHaveBeenCalledWith('tasks.create_success');
  });

  it('handles create task failure', async () => {
    const error = new Error('Create failed');
    vi.mocked(taskService.createTask).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateTask(), { wrapper });

    result.current.mutate({ title: 'New Task' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notify.error).toHaveBeenCalled();
  });

  it('updates a task successfully', async () => {
    vi.mocked(taskService.updateTask).mockResolvedValue({ id: '1', title: 'Updated' } as any);

    const { result } = renderHook(() => useUpdateTask(), { wrapper });

    result.current.mutate({ id: '1', data: { title: 'Updated' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notify.success).toHaveBeenCalledWith('tasks.update_success');
  });

  it('updates task status successfully with optimistic update', async () => {
    vi.mocked(taskService.updateTaskStatus).mockResolvedValue({
      id: '1',
      status: 'completed',
    } as any);

    const { result } = renderHook(() => useUpdateTaskStatus(), { wrapper });

    result.current.mutate({ id: '1', status: 'completed' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(taskService.updateTaskStatus).toHaveBeenCalledWith('1', 'completed');
  });

  it('handles update task status failure and rollbacks', async () => {
    const error = new Error('Status update failed');
    vi.mocked(taskService.updateTaskStatus).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateTaskStatus(), { wrapper });

    result.current.mutate({ id: '1', status: 'completed' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notify.error).toHaveBeenCalled();
    
    const { rollbackQueries } = await import('@/lib/query-utils');
    expect(rollbackQueries).toHaveBeenCalled();
  });

  it('deletes a task successfully with optimistic update', async () => {
    vi.mocked(taskService.deleteTask).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteTask(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notify.info).toHaveBeenCalledWith('tasks.delete_success');
  });

  it('handles delete task failure and rollbacks', async () => {
    const error = new Error('Delete failed');
    vi.mocked(taskService.deleteTask).mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteTask(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notify.error).toHaveBeenCalled();
    const { rollbackQueries } = await import('@/lib/query-utils');
    expect(rollbackQueries).toHaveBeenCalled();
  });
});
