import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { TaskCreate, TaskUpdate, TaskStatus, TaskPriority } from '../types/task';
import { useToastStore } from '../store/useToastStore';

export function useTasks(filters: {
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
  sort_by?: string;
  sort_dir?: string;
}) {
  return useInfiniteQuery({
    queryKey: ['tasks', filters],
    queryFn: ({ pageParam = 1 }) =>
      api.getTasks({
        ...filters,
        page: pageParam,
        page_size: 12,
      }),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.page_size);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (data: TaskCreate) => api.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      addToast('Task created successfully!', 'success');
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to create task', 'error');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskUpdate }) => api.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables.data.title) {
        addToast('Task updated successfully!', 'success');
      }
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to update task', 'error');
    },
  });
}

export function useToggleTaskStatus() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => api.toggleTaskStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to update status', 'error');
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      addToast('Task deleted successfully', 'info');
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to delete task', 'error');
    },
  });
}
