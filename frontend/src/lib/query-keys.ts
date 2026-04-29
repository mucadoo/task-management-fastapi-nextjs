import { TaskStatus, TaskPriority } from '@/types/task';

export const taskKeys = {
  all: (userId?: string) => (userId ? (['tasks', userId] as const) : (['tasks'] as const)),
  lists: (userId?: string) => [...taskKeys.all(userId), 'list'] as const,
  list: (
    userId: string | undefined,
    filters: {
      status?: TaskStatus;
      priority?: TaskPriority;
      q?: string;
      sort_by?: string;
      sort_dir?: string;
    },
  ) => [...taskKeys.lists(userId), filters] as const,
  details: (userId?: string) => [...taskKeys.all(userId), 'detail'] as const,
  detail: (userId: string | undefined, id: string) => [...taskKeys.details(userId), id] as const,
};
