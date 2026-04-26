import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useTaskStore } from '@/store/useTaskStore';
import { useTasks, useDeleteTask } from '@/hooks/useTasks';
import { Task } from '@/types/task';

export function useTaskBoard() {
  const {
    viewMode,
    setViewMode,
    filters,
    setFilters,
  } = useTaskStore();

  const [searchTerm, setSearchTerm] = useState(filters.q || '');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // React Query Hooks
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useTasks(filters);

  const deleteMutation = useDeleteTask();

  const tasks = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  const total = data?.pages[0]?.total || 0;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'personal' | 'security'>('personal');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (debouncedSearchTerm !== filters.q) {
      setFilters({ q: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, filters.q, setFilters]);

  const handleDeleteConfirm = useCallback(async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  }, [deletingId, deleteMutation]);

  const handleEdit = useCallback((t: Task) => {
    setEditingTask(t);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const handleNewTask = useCallback(() => {
    setEditingTask(null);
    setIsFormOpen(true);
  }, []);

  const handleProfileOpen = useCallback((tab: 'personal' | 'security') => {
    setProfileTab(tab);
    setIsProfileOpen(true);
  }, []);

  const handleProfileClose = useCallback(() => {
    setIsProfileOpen(false);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingTask(null);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeletingId(null);
  }, []);

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
    isFormOpen,
    isProfileOpen,
    profileTab,
    editingTask,
    deletingId,
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
    handleProfileClose,
    handleFormClose,
  };
}
