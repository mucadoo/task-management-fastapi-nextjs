import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { taskService } from '@/services/task-service';
import { taskKeys } from '@/lib/query-keys';
import { onMutateListUpdate, rollbackQueries } from '@/lib/query-utils';
import { TaskCreate, TaskUpdate, TaskStatus, TaskPriority, Task } from '@/types/task';
import { notify } from '@/lib/notifications';
import { ApiError } from '@/lib/api-client';
import { useGlobalLoadingStore } from '@/store/useGlobalLoadingStore';
import { useAuthStore } from '@/store/useAuthStore';

export function useTasks(filters: {
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
  sort_by?: string;
  sort_dir?: string;
}) {
  const { user } = useAuthStore();

  return useInfiniteQuery({
    queryKey: taskKeys.list(user?.id, filters),
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
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { startLoading, stopLoading } = useGlobalLoadingStore.getState();

  return useMutation({
    mutationFn: (data: TaskCreate) => taskService.createTask(data),
    onMutate: () => {
      startLoading();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists(user?.id) });
      notify.success('tasks.create_success');
    },
    onError: (error: ApiError) => notify.error(error, 'tasks.create_failed'),
    onSettled: () => {
      stopLoading();
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { startLoading, stopLoading } = useGlobalLoadingStore.getState();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskUpdate }) =>
      taskService.updateTask(id, data),
    onMutate: () => {
      startLoading();
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all(user?.id) });
      if (variables.data.title) {
        notify.success('tasks.update_success');
      }
    },
    onError: (error: ApiError) => notify.error(error, 'tasks.update_failed'),
    onSettled: () => {
      stopLoading();
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { startLoading, stopLoading } = useGlobalLoadingStore.getState();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskService.updateTaskStatus(id, status),
    onMutate: async ({ id, status: newStatus }) => {
      startLoading();
      return await onMutateListUpdate<Task>(queryClient, taskKeys.lists(user?.id), (page) => ({
        ...page,
        items: page.items.map((task) => {
          if (task.id === id) {
            return {
              ...task,
              status: newStatus,
            };
          }
          return task;
        }),
      }));
    },
    onError: (err: ApiError, _variables, context) => {
      rollbackQueries(queryClient, context);
      notify.error(err, 'tasks.status_update_failed');
    },
    onSettled: () => {
      stopLoading();
      void queryClient.invalidateQueries({ queryKey: taskKeys.all(user?.id) });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { startLoading, stopLoading } = useGlobalLoadingStore.getState();

  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onMutate: (id: string) => {
      startLoading();
      return onMutateListUpdate<Task>(queryClient, taskKeys.lists(user?.id), (page) => ({
        ...page,
        items: page.items.filter((task) => task.id !== id),
        total: page.total - 1,
      }));
    },
    onError: (err: ApiError, id: string, context: unknown) => {
      rollbackQueries(queryClient, context);
      notify.error(err, 'tasks.delete_failed');
    },
    onSuccess: () => {
      notify.info('tasks.delete_success');
    },
    onSettled: () => {
      stopLoading();
      void queryClient.invalidateQueries({ queryKey: taskKeys.all(user?.id) });
    },
  });
}
