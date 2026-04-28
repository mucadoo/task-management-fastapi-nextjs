import { useToastStore } from '@/store/useToastStore';
import i18n from '@/lib/i18n';
import { getErrorMessage } from './error-utils';

/**
 * Centralized notification utility to reduce boilerplate for toast messages.
 * Can be used in components, hooks, and Zustand stores.
 */
export const notify = {
  success: (key: string) => {
    useToastStore.getState().addToast(i18n.t(key), 'success');
  },

  error: (error: unknown, fallbackKey: string) => {
    const rawMessage = getErrorMessage(error);
    const message =
      rawMessage === 'common.error_unknown' || rawMessage === 'Error'
        ? i18n.t(fallbackKey)
        : rawMessage.includes('common.') ||
            rawMessage.includes('auth.') ||
            rawMessage.includes('tasks.')
          ? i18n.t(rawMessage)
          : rawMessage;
    useToastStore.getState().addToast(message, 'error');
  },

  info: (key: string) => {
    useToastStore.getState().addToast(i18n.t(key), 'info');
  },

  warn: (key: string) => {
    useToastStore.getState().addToast(i18n.t(key), 'warning');
  },
};
