'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Task } from '../types/task';
import { useDebounce } from 'use-debounce';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskSkeleton from './ui/TaskSkeleton';
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger';
import ErrorMessage from './ui/ErrorMessage';
import ConfirmDialog from './ui/ConfirmDialog';
import DashboardHeader from './DashboardHeader';
import TaskFilters from './TaskFilters';
import { useTranslation } from 'react-i18next';
import { useTaskStore } from '../store/useTaskStore';
import { useTasks, useDeleteTask } from '../hooks/useTasks';
import { LayoutGrid, List } from 'lucide-react';
import { TooltipSimple } from './ui/Tooltip';
import { cn } from '../lib/utils';

export default function TaskBoard() {
  const { t } = useTranslation();

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

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const handleEdit = useCallback((t: Task) => {
    setEditingTask(t);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-[#0a0a0a]">
      <DashboardHeader
        totalTasks={total}
        onProfileOpen={(tab) => {
          setProfileTab(tab);
          setIsProfileOpen(true);
        }}
        isProfileOpen={isProfileOpen}
        onProfileClose={() => setIsProfileOpen(false)}
        profileTab={profileTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="rule-brand mb-4 w-8 h-1" />
            <h1 className="text-2xl font-bold text-warm-900 dark:text-gray-100 tracking-tight">
              {t('tasks.title')}
            </h1>
          </div>
          
          <div className="flex gap-1 p-1 bg-warm-100 dark:bg-white/5 rounded-lg border border-warm-200 dark:border-white/5">
            <TooltipSimple content={t('tasks.view_gallery')} side="bottom">
              <button
                onClick={() => setViewMode('gallery')}
                className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center transition-all",
                  viewMode === 'gallery' 
                    ? "bg-white dark:bg-white/10 text-brand-500 shadow-sm" 
                    : "text-warm-500 hover:text-warm-900 dark:hover:text-gray-100"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </TooltipSimple>
            
            <TooltipSimple content={t('tasks.view_list')} side="bottom">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center transition-all",
                  viewMode === 'list' 
                    ? "bg-white dark:bg-white/10 text-brand-500 shadow-sm" 
                    : "text-warm-500 hover:text-warm-900 dark:hover:text-gray-100"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </TooltipSimple>
          </div>
        </div>

        <TaskFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onNewTask={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
        />

        {error && (
          <div className="mb-6">
            <ErrorMessage message={(error as any).message || t('common.error')} />
          </div>
        )}

        {isLoading && tasks.length === 0 ? (
          <div
            className={cn(
              viewMode === 'gallery'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
                : 'space-y-3'
            )}
          >
            {[...Array(6)].map((_, i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <>
            <div
              className={cn(
                viewMode === 'gallery'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-500'
                  : 'flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500'
              )}
            >
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  viewMode={viewMode}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === task.id}
                />
              ))}
              {isFetchingNextPage && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <TaskSkeleton key={`more-${i}`} />
                  ))}
                </>
              )}
            </div>
            <InfiniteScrollTrigger
              onIntersect={() => fetchNextPage()}
              isLoading={isFetchingNextPage}
              hasMore={!!hasNextPage}
            />
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-warm-300 dark:border-white/5 rounded-xl text-warm-600 dark:text-gray-500">
            {t('tasks.no_tasks')}
          </div>
        )}

        <TaskForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
          editingTask={editingTask}
        />

        <ConfirmDialog
          isOpen={deletingId !== null}
          message={t('tasks.confirm_delete')}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingId(null)}
          isLoading={deleteMutation.isPending}
        />
      </main>
    </div>
  );
}
