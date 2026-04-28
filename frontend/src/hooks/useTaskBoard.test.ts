import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskBoard } from './useTaskBoard';
import { useTasks } from './useTasks';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock('./useTasks', () => ({
  useTasks: vi.fn(),
  useDeleteTask: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('@/store/useTaskStore', () => ({
  useTaskStore: vi.fn(() => ({
    viewMode: 'gallery',
    setViewMode: vi.fn(),
  })),
}));

vi.mock('use-debounce', () => ({
  useDebounce: (value: any) => [value],
}));

describe('useTaskBoard', () => {
  const mockRouter = { replace: vi.fn() };
  const mockSearchParams = { get: vi.fn() };
  const mockPathname = '/app';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);
    vi.mocked(usePathname).mockReturnValue(mockPathname);

    vi.mocked(useTasks).mockReturnValue({
      data: { pages: [{ items: [], total: 0 }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      error: null,
    } as any);
  });

  it('initializes with default filters', () => {
    mockSearchParams.get.mockReturnValue(null);
    const { result } = renderHook(() => useTaskBoard());

    expect(result.current.filters.q).toBe('');
    expect(result.current.filters.sort_by).toBe('due_date');
  });

  it('updates search term and filters', () => {
    mockSearchParams.get.mockReturnValue(null);
    const { result } = renderHook(() => useTaskBoard());

    act(() => {
      result.current.setSearchTerm('test');
    });

    expect(result.current.searchTerm).toBe('test');

    expect(mockRouter.replace).toHaveBeenCalledWith(expect.stringContaining('q=test'), {
      scroll: false,
    });
  });
});
