import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTaskForm } from './useTaskForm';
import { useCreateTask, useUpdateTask } from './useTasks';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('./useTasks', () => ({
  useCreateTask: vi.fn(),
  useUpdateTask: vi.fn(),
}));

vi.mock('@/lib/notifications', () => ({
  notify: {
    error: vi.fn(),
  },
}));

describe('useTaskForm', () => {
  const mockOnClose = vi.fn();
  const mockCreateMutateAsync = vi.fn();
  const mockUpdateMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateTask).mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    } as any);
    vi.mocked(useUpdateTask).mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      isPending: false,
    } as any);
  });

  it('initializes with default values when not editing', () => {
    const { result } = renderHook(() => useTaskForm({ editingTask: null, isOpen: true, onClose: mockOnClose }));
    expect(result.current.form.getValues().title).toBe('');
    expect(result.current.form.getValues().status).toBe('pending');
  });

  it('initializes with task values when editing', () => {
    const task = { id: '1', title: 'Existing Task', status: 'completed', priority: 'high' } as any;
    const { result } = renderHook(() => useTaskForm({ editingTask: task, isOpen: true, onClose: mockOnClose }));
    expect(result.current.form.getValues().title).toBe('Existing Task');
    expect(result.current.form.getValues().status).toBe('completed');
  });

  it('calls create mutation on submit when not editing', async () => {
    const { result } = renderHook(() => useTaskForm({ editingTask: null, isOpen: true, onClose: mockOnClose }));

    result.current.form.setValue('title', 'New Task');
    await result.current.onSubmit();

    expect(mockCreateMutateAsync).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});