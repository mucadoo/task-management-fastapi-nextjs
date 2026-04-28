import { create } from 'zustand';

interface GlobalLoadingState {
  progress: number;
  isVisible: boolean;
  activeLoaders: number;
  startLoading: () => void;
  stopLoading: () => void;
}

let trickleInterval: ReturnType<typeof setInterval> | null = null;
let hideTimeout: ReturnType<typeof setTimeout> | null = null;

export const useGlobalLoadingStore = create<GlobalLoadingState>((set, get) => ({
  progress: 0,
  isVisible: false,
  activeLoaders: 0,

  startLoading: () => {
    const { activeLoaders } = get();
    set({ activeLoaders: activeLoaders + 1 });

    if (activeLoaders === 0) {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      if (trickleInterval) clearInterval(trickleInterval);

      set({ isVisible: true, progress: 5 + Math.random() * 5 });

      trickleInterval = setInterval(() => {
        const { progress } = get();
        if (progress < 90) {
          const inc = Math.random() * 3;
          set({ progress: Math.min(90, progress + inc) }); 
        }
      }, 400);
    }
  },

  stopLoading: () => {
    const { activeLoaders } = get();
    const newActiveLoaders = Math.max(0, activeLoaders - 1);
    set({ activeLoaders: newActiveLoaders });

    if (newActiveLoaders === 0) {
      if (trickleInterval) {
        clearInterval(trickleInterval);
        trickleInterval = null;
      }

      set({ progress: 100 });

      hideTimeout = setTimeout(() => {
        set({ isVisible: false });

        setTimeout(() => {
          const current = get();
          if (current.activeLoaders === 0 && !current.isVisible) {
            set({ progress: 0 });
          }
        }, 300);
      }, 200);
    }
  },
}));
