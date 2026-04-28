import { TaskStatus, TaskPriority } from '@/types/task';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    q?: string;
    sort_by?: string;
    sort_dir?: string;
  }) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};
