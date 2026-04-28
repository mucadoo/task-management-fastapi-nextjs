import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TaskUIState {
  viewMode: 'gallery' | 'list';
  setViewMode: (viewMode: 'gallery' | 'list') => void;
}

export const useTaskStore = create<TaskUIState>()(
  persist(
    (set) => ({
      viewMode: 'gallery',
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: 'task-ui-storage',

      partialize: (state) => ({ viewMode: state.viewMode }),
    },
  ),
);
