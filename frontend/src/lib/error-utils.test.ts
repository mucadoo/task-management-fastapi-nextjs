import { describe, it, expect, vi } from 'vitest';
import { getErrorMessage, useApiError } from './error-utils';
import { renderHook } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('error-utils', () => {
  describe('getErrorMessage', () => {
    it('returns unknown error for null/undefined', () => {
      expect(getErrorMessage(null)).toBe('common.error_unknown');
    });

    it('returns network error message', () => {
      expect(getErrorMessage({ message: 'Network Error' })).toBe('common.error_network');
    });

    it('returns string detail from response data', () => {
      const error = {
        response: {
          data: { detail: 'Custom error detail' },
        },
      };
      expect(getErrorMessage(error)).toBe('Custom error detail');
    });

    it('formats array detail from response data', () => {
      const error = {
        response: {
          data: {
            detail: [
              { loc: ['body', 'username'], msg: 'field required' },
              { loc: ['body', 'password'], msg: 'too short' },
            ],
          },
        },
      };
      expect(getErrorMessage(error)).toBe(
        'body.username: field required, body.password: too short',
      );
    });

    it('returns message or error property as fallback', () => {
      expect(getErrorMessage({ response: { data: { message: 'Msg' } } })).toBe('Msg');
      expect(getErrorMessage({ response: { data: { error: 'Err' } } })).toBe('Err');
    });
  });

  describe('useApiError', () => {
    it('translates known error keys', () => {
      const { result } = renderHook(() => useApiError());
      expect(result.current.getTranslatedError({ message: 'auth.login_failed' })).toBe(
        'auth.login_failed',
      );
    });

    it('returns raw message for unknown keys', () => {
      const { result } = renderHook(() => useApiError());
      expect(result.current.getTranslatedError({ message: 'Something went wrong' })).toBe(
        'Something went wrong',
      );
    });

    it('uses fallback key if provided and message is unknown', () => {
      const { result } = renderHook(() => useApiError());
      expect(result.current.getTranslatedError(null, 'fallback.key')).toBe('fallback.key');
    });
  });
});
