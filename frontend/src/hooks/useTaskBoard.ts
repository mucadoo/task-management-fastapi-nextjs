import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useTaskStore } from '@/store/useTaskStore';
import { useTasks, useDeleteTask } from '@/hooks/useTasks';
import { Task } from '@/types/task';
import { useDisclosure } from './useDisclosure';
import { useDataDisclosure } from './useDataDisclosure';

export function useTaskBoard() {
  const { viewMode, setViewMode, filters, setFilters } = useTaskStore();

  const [searchTerm, setSearchTerm] = useState(filters.q || '');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // React Query Hooks
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
    useTasks(filters);

  const deleteMutation = useDeleteTask();

  const tasks = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  const total = data?.pages[0]?.total || 0;

  // Disclosures
  const formDisclosure = useDataDisclosure<Task>();
  const profileDisclosure = useDataDisclosure<'personal' | 'security'>('personal');
  const deleteDisclosure = useDataDisclosure<string>();

  useEffect(() => {
    if (debouncedSearchTerm !== filters.q) {
      setFilters({ q: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, filters.q, setFilters]);

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
    // Data
    tasks,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,

    // UI State
    viewMode,
    filters,
    searchTerm,
    isFormOpen: formDisclosure.isOpen,
    isProfileOpen: profileDisclosure.isOpen,
    profileTab: profileDisclosure.data || 'personal',
    editingTask: formDisclosure.data,
    deletingId: deleteDisclosure.data,
    isDeleting: deleteMutation.isPending,

    // Actions
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
