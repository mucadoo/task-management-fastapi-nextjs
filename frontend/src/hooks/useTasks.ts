import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query';
import { taskService } from '@/services/task-service';
import { taskKeys } from '@/lib/query-keys';
import {
  TaskCreate,
  TaskUpdate,
  TaskStatus,
  TaskPriority,
  PaginatedResponse,
  Task,
} from '@/types/task';
import { useToastStore } from '@/store/useToastStore';
import i18n from '@/lib/i18n';
import { notify } from '@/lib/notifications';

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

/**
 * Helper to handle optimistic updates for paginated lists
 */
async function onMutateListUpdate<T>(
  queryClient: QueryClient,
  updateFn: (page: PaginatedResponse<T>) => PaginatedResponse<T>
) {
  // Cancel any outgoing refetches
  await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

  // Snapshot previous value
  const previousQueries = queryClient.getQueriesData({ queryKey: taskKeys.lists() });

  // Optimistically update all list queries
  queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map(updateFn),
    };
  });

  return { previousQueries };
}

/**
 * Helper to rollback optimistic updates on error
 */
function rollbackQueries(queryClient: QueryClient, context: any) {
  if (context?.previousQueries) {
    context.previousQueries.forEach(([queryKey, data]: any) => {
      queryClient.setQueryData(queryKey, data);
    });
  }
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskCreate) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      notify.success('tasks.create_success');
    },
    onError: (error: any) => notify.error(error, 'tasks.create_failed'),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskUpdate }) =>
      taskService.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      if (variables.data.title) {
        notify.success('tasks.update_success');
      }
    },
    onError: (error: any) => notify.error(error, 'tasks.update_failed'),
  });
}

export function useToggleTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.toggleTaskStatus(id),
    onMutate: (id: string) => 
      onMutateListUpdate<Task>(queryClient, (page) => ({
        ...page,
        items: page.items.map((task) => {
          if (task.id === id) {
            return {
              ...task,
              status: task.status === 'completed' ? 'pending' : 'completed',
            };
          }
          return task;
        }),
      })),
    onError: (err: any, id: string, context: any) => {
      rollbackQueries(queryClient, context);
      notify.error(err, 'tasks.status_update_failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onMutate: (id: string) => 
      onMutateListUpdate<Task>(queryClient, (page) => ({
        ...page,
        items: page.items.filter((task) => task.id !== id),
        total: page.total - 1,
      })),
    onError: (err: any, id: string, context: any) => {
      rollbackQueries(queryClient, context);
      notify.error(err, 'tasks.delete_failed');
    },
    onSuccess: () => {
      notify.info('tasks.delete_success');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
