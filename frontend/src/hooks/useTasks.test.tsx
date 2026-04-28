import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useToggleTaskStatus,
  useDeleteTask,
} from './useTasks';
import { taskService } from '@/services/task-service';
import { ReactNode } from 'react';

vi.mock('@/services/task-service', () => ({
  taskService: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    toggleTaskStatus: vi.fn(),
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
    const mockData = { items: [{ id: '1', title: 'Task 1' }], total: 1, page: 1, page_size: 12 };
    vi.mocked(taskService.getTasks).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useTasks({}), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0]).toEqual(mockData);
  });

  it('handles create task success', async () => {
    const newTask = { title: 'New Task', status: 'pending' as const, priority: 'medium' as const };
    vi.mocked(taskService.createTask).mockResolvedValue({ id: '2', ...newTask } as any);

    const { result } = renderHook(() => useCreateTask(), { wrapper });

    result.current.mutate(newTask);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(taskService.createTask).toHaveBeenCalledWith(newTask);
  });

  it('handles update task success', async () => {
    const updateData = { title: 'Updated Task' };
    vi.mocked(taskService.updateTask).mockResolvedValue({ id: '1', ...updateData } as any);

    const { result } = renderHook(() => useUpdateTask(), { wrapper });

    result.current.mutate({ id: '1', data: updateData });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(taskService.updateTask).toHaveBeenCalledWith('1', updateData);
  });

  it('handles toggle task status', async () => {
    vi.mocked(taskService.toggleTaskStatus).mockResolvedValue({
      id: '1',
      status: 'completed',
    } as any);

    const { result } = renderHook(() => useToggleTaskStatus(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(taskService.toggleTaskStatus).toHaveBeenCalledWith('1');
  });

  it('handles delete task success', async () => {
    vi.mocked(taskService.deleteTask).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteTask(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(taskService.deleteTask).toHaveBeenCalledWith('1');
  });
});
