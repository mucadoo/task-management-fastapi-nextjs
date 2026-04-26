import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { taskService } from '../services/task-service';
import {
  TaskCreate,
  TaskUpdate,
  TaskStatus,
  TaskPriority,
  PaginatedResponse,
  Task,
} from '../types/task';
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
      taskService.getTasks({
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
    mutationFn: (data: TaskCreate) => taskService.createTask(data),
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
    mutationFn: ({ id, data }: { id: string; data: TaskUpdate }) =>
      taskService.updateTask(id, data),
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
    mutationFn: (id: string) => taskService.toggleTaskStatus(id),
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks']);

      // Optimistically update to the new value
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: PaginatedResponse<Task>) => ({
            ...page,
            items: page.items.map((task: Task) => {
              if (task.id === id) {
                return {
                  ...task,
                  status:
                    task.status === 'completed' ? 'pending' : 'completed',
                };
              }
              return task;
            }),
          })),
        };
      });

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (err: any, id: string, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      addToast(err.message || 'Failed to update status', 'error');
    },
    onSettled: () => {
      // Always refetch after error or success to keep server in sync
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: PaginatedResponse<Task>) => ({
            ...page,
            items: page.items.filter((task: Task) => task.id !== id),
            total: page.total - 1,
          })),
        };
      });

      return { previousTasks };
    },
    onError: (err: any, id: string, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      addToast(err.message || 'Failed to delete task', 'error');
    },
    onSuccess: () => {
      addToast('Task deleted successfully', 'info');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
