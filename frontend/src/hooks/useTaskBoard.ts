import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useTaskStore } from '@/store/useTaskStore';
import { useTasks, useDeleteTask } from '@/hooks/useTasks';
import { Task } from '@/types/task';
import { useDisclosure } from './useDisclosure';

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

  // Disclosures
  const formDisclosure = useDisclosure(false);
  const profileDisclosure = useDisclosure(false);
  
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
    formDisclosure.onOpen();
  }, [formDisclosure]);

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const handleNewTask = useCallback(() => {
    setEditingTask(null);
    formDisclosure.onOpen();
  }, [formDisclosure]);

  const handleProfileOpen = useCallback((tab: 'personal' | 'security') => {
    setProfileTab(tab);
    profileDisclosure.onOpen();
  }, [profileDisclosure]);

  const handleFormClose = useCallback(() => {
    formDisclosure.onClose();
    setEditingTask(null);
  }, [formDisclosure]);

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
    isFormOpen: formDisclosure.isOpen,
    isProfileOpen: profileDisclosure.isOpen,
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
    handleProfileClose: profileDisclosure.onClose,
    handleFormClose,
  };
}
