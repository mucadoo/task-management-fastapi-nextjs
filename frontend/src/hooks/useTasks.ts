import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { taskService } from '../services/task-service';
import { taskKeys } from '../lib/query-keys';
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
    queryKey: taskKeys.list(filters),
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
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
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
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      // Snapshot previous value
      const previousQueries = queryClient.getQueriesData({ queryKey: taskKeys.lists() });

      // Optimistically update all list queries
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
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

      return { previousQueries };
    },
    onError: (err: any, id: string, context: any) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      addToast(err.message || 'Failed to update status', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previousQueries = queryClient.getQueriesData({ queryKey: taskKeys.lists() });

      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
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

      return { previousQueries };
    },
    onError: (err: any, id: string, context: any) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      addToast(err.message || 'Failed to delete task', 'error');
    },
    onSuccess: () => {
      addToast('Task deleted successfully', 'info');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
