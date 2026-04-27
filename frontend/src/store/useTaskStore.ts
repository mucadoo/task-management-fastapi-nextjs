import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskStatus, TaskPriority } from '../types/task';

interface TaskUIState {
  viewMode: 'gallery' | 'list';
  filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    q?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  setViewMode: (viewMode: 'gallery' | 'list') => void;
  setFilters: (filters: Partial<TaskUIState['filters']>) => void;
  resetFilters: () => void;
}

export const useTaskStore = create<TaskUIState>()(
  persist(
    (set) => ({
      viewMode: 'gallery',
      filters: {
        sort_by: 'due_date',
        sort_dir: 'asc',
      },

      setViewMode: (viewMode) => set({ viewMode }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () =>
        set({
          filters: {
            sort_by: 'due_date',
            sort_dir: 'asc',
          },
        }),
    }),
    {
      name: 'task-ui-storage',
    },
  ),
);
