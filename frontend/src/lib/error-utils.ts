import { useTranslation } from 'react-i18next';

export interface ApiErrorResponse {
  detail?: string | Array<{ msg: string; loc: string[] }>;
  message?: string;
  error?: string;
}

/**
 * Extracts a human-readable error message from an API error response.
 * Handles FastAPI's default detail format as well as custom AppError formats.
 */
export function getErrorMessage(error: any): string {
  if (!error) return 'common.error_unknown';

  const data = error.response?.data as ApiErrorResponse;

  if (!data) {
    if (error.message === 'Network Error') return 'common.error_network';
    return error.message || 'common.error_unknown';
  }

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    
    return data.detail.map((err) => `${err.loc.join('.')}: ${err.msg}`).join(', ');
  }

  return data.message || data.error || 'common.error_unknown';
}

/**
 * Hook to get translated error messages.
 */
export function useApiError() {
  const { t } = useTranslation();

  const getTranslatedError = (error: any, fallbackKey?: string) => {
    const message = getErrorMessage(error);

    
    if (message.includes('common.') || message.includes('auth.') || message.includes('tasks.')) {
      return t(message);
    }

    
    if (fallbackKey && (message === 'common.error_unknown' || message === 'Error')) {
      return t(fallbackKey);
    }

    return message;
  };

  return { getTranslatedError };
}
