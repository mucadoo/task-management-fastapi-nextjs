import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginData, RegisterData, UpdateMeData } from '@/types/auth';
import { authService } from '@/services/auth-service';
import { tokenManager } from '@/lib/token';
import i18n from '@/lib/i18n';
import { notify } from '@/lib/notifications';
import { useGlobalLoadingStore } from './useGlobalLoadingStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchMe: (force?: boolean) => Promise<void>;
  updateMe: (data: UpdateMeData) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: tokenManager.isAuthenticated(),
      isLoading: false,
      isInitializing: false,
      error: null,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user || tokenManager.isAuthenticated() });
      },

      login: async (data) => {
        const { startLoading, stopLoading } = useGlobalLoadingStore.getState();
        set({ isLoading: true, error: null });
        startLoading();
        try {
          await authService.login(data);
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const message = (err as { message?: string }).message || i18n.t('auth.login_failed');
          set({ error: message, isLoading: false, isAuthenticated: false });
          notify.error(err, 'auth.login_failed');
          throw err;
        } finally {
          stopLoading();
        }
      },

      register: async (data) => {
        const { startLoading, stopLoading } = useGlobalLoadingStore.getState();
        set({ isLoading: true, error: null });
        startLoading();
        try {
          await authService.register(data);
          set({ isLoading: false });
          notify.success('auth.register_success');
        } catch (err: unknown) {
          const message = (err as { message?: string }).message || i18n.t('auth.register_failed');
          set({ error: message, isLoading: false, isAuthenticated: false });
          notify.error(err, 'auth.register_failed');
          throw err;
        } finally {
          stopLoading();
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
          isInitializing: false,
        });
      },

      fetchMe: async (force = false) => {
        if (!tokenManager.isAuthenticated()) {
          if (get().user || get().isAuthenticated) {
            set({ user: null, isAuthenticated: false });
          }
          return;
        }

        if (get().user && !force) return;

        const { startLoading, stopLoading } = useGlobalLoadingStore.getState();
        set({ isInitializing: true });
        startLoading();
        try {
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isInitializing: false });
        } catch {
          authService.logout();
          set({ user: null, isAuthenticated: false, isInitializing: false });
        } finally {
          stopLoading();
        }
      },

      updateMe: async (data) => {
        const { startLoading, stopLoading } = useGlobalLoadingStore.getState();
        set({ isLoading: true, error: null });
        startLoading();
        try {
          const updatedUser = await authService.updateMe(data);
          set({ user: updatedUser, isLoading: false });
        } catch (err: unknown) {
          const message = (err as { message?: string }).message || i18n.t('profile.update_failed');
          set({ error: message, isLoading: false });
          throw err;
        } finally {
          stopLoading();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    },
  ),
);
