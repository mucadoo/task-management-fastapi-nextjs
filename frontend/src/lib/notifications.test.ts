import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notify } from './notifications';
import { useToastStore } from '@/store/useToastStore';

const mockAddToast = vi.fn();

vi.mock('@/store/useToastStore', () => ({
  useToastStore: {
    getState: vi.fn(() => ({
      addToast: mockAddToast,
    })),
  },
}));

vi.mock('@/lib/i18n', () => ({
  default: {
    t: (key: string) => key,
  },
}));

describe('notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls addToast for success', () => {
    notify.success('test.key');
    expect(mockAddToast).toHaveBeenCalledWith('test.key', 'success');
  });

  it('calls addToast for error with fallback', () => {
    notify.error(null, 'fallback.key');
    expect(mockAddToast).toHaveBeenCalledWith('fallback.key', 'error');
  });

  it('calls addToast for info', () => {
    notify.info('info.key');
    expect(mockAddToast).toHaveBeenCalledWith('info.key', 'info');
  });

  it('calls addToast for warn', () => {
    notify.warn('warn.key');
    expect(mockAddToast).toHaveBeenCalledWith('warn.key', 'warning');
  });
});
