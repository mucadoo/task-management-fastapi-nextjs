import { useTranslation } from 'react-i18next';

export interface ApiErrorResponse {
  detail?: string | Array<{ msg: string; loc: string[] }>;
  message?: string;
  error?: string;
}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'common.error_unknown';

  const err = error as { response?: { data?: ApiErrorResponse }; message?: string };
  const data = err.response?.data;

  if (!data) {
    if (err.message === 'Network Error') return 'common.error_network';
    return err.message || 'common.error_unknown';
  }

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => `${item.loc.join('.')}: ${item.msg}`).join(', ');
  }

  return data.message || data.error || 'common.error_unknown';
}

export function useApiError() {
  const { t } = useTranslation();

  const getTranslatedError = (error: unknown, fallbackKey?: string) => {
    const message = getErrorMessage(error);

    if (fallbackKey && (message === 'common.error_unknown' || message === 'Error')) {
      return t(fallbackKey);
    }

    if (message.includes('common.') || message.includes('auth.') || message.includes('tasks.')) {
      return t(message);
    }

    return message;
  };

  return { getTranslatedError };
}
