import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useTaskStore } from '@/store/useTaskStore';
import { useTasks, useDeleteTask } from '@/hooks/useTasks';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { useDataDisclosure } from './useDataDisclosure';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function useTaskBoard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { viewMode, setViewMode } = useTaskStore();

  const filters = useMemo(() => ({
    status: (searchParams.get('status') as TaskStatus) || undefined,
    priority: (searchParams.get('priority') as TaskPriority) || undefined,
    q: searchParams.get('q') || '',
    sort_by: searchParams.get('sort_by') || 'due_date',
    sort_dir: searchParams.get('sort_dir') || 'asc',
  }), [searchParams]);

  const [searchTerm, setSearchTerm] = useState(filters.q);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
    useTasks(filters);

  const deleteMutation = useDeleteTask();

  const tasks = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  const total = data?.pages[0]?.total || 0;

  const formDisclosure = useDataDisclosure<Task>();
  const profileDisclosure = useDataDisclosure<'personal' | 'security'>('personal');
  const deleteDisclosure = useDataDisclosure<string>();

  const setFilters = useCallback((newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  useEffect(() => {
    if (debouncedSearchTerm !== filters.q) {
      setFilters({ q: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, filters.q, setFilters]);

  // Update local search term when URL filter changes (e.g. on navigation or reset)
  useEffect(() => {
    setSearchTerm(filters.q);
  }, [filters.q]);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDisclosure.data) {
      await deleteMutation.mutateAsync(deleteDisclosure.data);
      deleteDisclosure.onClose();
    }
  }, [deleteDisclosure, deleteMutation]);

  const handleEdit = useCallback(
    (t: Task) => {
      formDisclosure.onOpen(t);
    },
    [formDisclosure],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteDisclosure.onOpen(id);
    },
    [deleteDisclosure],
  );

  const handleNewTask = useCallback(() => {
    formDisclosure.onOpen(null);
  }, [formDisclosure]);

  const handleProfileOpen = useCallback(
    (tab: 'personal' | 'security') => {
      profileDisclosure.onOpen(tab);
    },
    [profileDisclosure],
  );

  const handleFormClose = useCallback(() => {
    formDisclosure.onClose();
  }, [formDisclosure]);

  const handleCancelDelete = useCallback(() => {
    deleteDisclosure.onClose();
  }, [deleteDisclosure]);

  return {
    tasks,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,

    viewMode,
    filters,
    searchTerm,
    isFormOpen: formDisclosure.isOpen,
    isProfileOpen: profileDisclosure.isOpen,
    profileTab: profileDisclosure.data || 'personal',
    editingTask: formDisclosure.data,
    deletingId: deleteDisclosure.data,
    isDeleting: deleteMutation.isPending,

    setViewMode,
    setFilters,
    setSearchTerm,
    fetchNextPage,
    handleEdit,
    handleDelete,
    handleDeleteConfirm,
    handleCancelDelete,
    handleNewTask,
    handleProfileOpen,
    handleProfileClose: profileDisclosure.onClose,
    handleFormClose,
  };
}
