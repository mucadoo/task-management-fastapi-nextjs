import { useToastStore } from '@/store/useToastStore';
import i18n from '@/lib/i18n';

/**
 * Centralized notification utility to reduce boilerplate for toast messages.
 * Can be used in components, hooks, and Zustand stores.
 */
export const notify = {
  success: (key: string) => {
    useToastStore.getState().addToast(i18n.t(key), 'success');
  },
  
  error: (error: any, fallbackKey: string) => {
    const message = error?.message || i18n.t(fallbackKey);
    useToastStore.getState().addToast(message, 'error');
  },
  
  info: (key: string) => {
    useToastStore.getState().addToast(i18n.t(key), 'info');
  },
  
  warn: (key: string) => {
    useToastStore.getState().addToast(i18n.t(key), 'warning');
  }
};
