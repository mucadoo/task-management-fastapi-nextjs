import { describe, it, expect, beforeEach } from 'vitest';
import { useToastStore } from './useToastStore';

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('adds a toast correctly', () => {
    useToastStore.getState().addToast('Success message', 'success');
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0]).toMatchObject({
      message: 'Success message',
      type: 'success',
    });
  });

  it('removes a toast correctly', () => {
    useToastStore.getState().addToast('To be removed');
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
