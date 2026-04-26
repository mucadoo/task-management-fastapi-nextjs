import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';
import { api } from '../lib/api';
import { useToastStore } from './useToastStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateMe: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
      isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
      isLoading: false,
      error: null,

      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
      },

      setUser: (user) => {
        set({ user });
      },

      login: async (data) => {
        set({ isLoading: true, error: null });
        const { addToast } = useToastStore.getState();
        try {
          const res = await api.login(data);
          set({ token: res.access_token, isAuthenticated: true });
          const user = await api.getMe(res.access_token);
          set({ user, isLoading: false });
          addToast('Successfully logged in!', 'success');
        } catch (err: any) {
          const message = err.message || 'Login failed';
          set({ error: message, isLoading: false });
          addToast(message, 'error');
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        const { addToast } = useToastStore.getState();
        try {
          const res = await api.register(data);
          set({ token: res.access_token, isAuthenticated: true });
          const user = await api.getMe(res.access_token);
          set({ user, isLoading: false });
          addToast('Account created successfully!', 'success');
        } catch (err: any) {
          const message = err.message || 'Registration failed';
          set({ error: message, isLoading: false });
          addToast(message, 'error');
          throw err;
        }
      },

      logout: () => {
        api.logout();
        set({ user: null, token: null, isAuthenticated: false });
        useToastStore.getState().addToast('Logged out successfully', 'info');
      },

      fetchMe: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        set({ isLoading: true });
        try {
          const user = await api.getMe(token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          api.logout();
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateMe: async (data) => {
        set({ isLoading: true, error: null });
        const { addToast } = useToastStore.getState();
        try {
          const updatedUser = await api.updateMe(data);
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
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
