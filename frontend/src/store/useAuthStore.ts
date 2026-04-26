import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginData, RegisterData, UpdateMeData } from '@/types/auth';
import { authService } from '@/services/auth-service';
import { tokenManager } from '@/lib/token';
import { useToastStore } from '@/store/useToastStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
      error: null,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user || tokenManager.isAuthenticated() });
      },

      login: async (data) => {
        set({ isLoading: true, error: null });
        const { addToast } = useToastStore.getState();
        try {
          await authService.login(data);
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
          addToast('Successfully logged in!', 'success');
        } catch (err: any) {
          const message = err.message || 'Login failed';
          set({ error: message, isLoading: false, isAuthenticated: false });
          addToast(message, 'error');
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        const { addToast } = useToastStore.getState();
        try {
          await authService.register(data);
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
          addToast('Account created successfully!', 'success');
        } catch (err: any) {
          const message = err.message || 'Registration failed';
          set({ error: message, isLoading: false, isAuthenticated: false });
          addToast(message, 'error');
          throw err;
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false, error: null });
        useToastStore.getState().addToast('Logged out successfully', 'info');
      },

      fetchMe: async (force = false) => {
        if (!tokenManager.isAuthenticated()) {
          if (get().user || get().isAuthenticated) {
             set({ user: null, isAuthenticated: false });
          }
          return;
        }
        
        // Skip if we already have a user and aren't forcing a refresh
        if (get().user && !force) return;

        set({ isLoading: true });
        try {
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          // If fetchMe fails, the token is likely invalid/expired
          authService.logout();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateMe: async (data) => {
        set({ isLoading: true, error: null });
        const { addToast } = useToastStore.getState();
        try {
          const updatedUser = await authService.updateMe(data);
          set({ user: updatedUser, isLoading: false });
          addToast('Profile updated successfully!', 'success');
        } catch (err: any) {
          const message = err.message || 'Update failed';
          set({ error: message, isLoading: false });
          addToast(message, 'error');
          throw err;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
);
