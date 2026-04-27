'use client';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskSkeleton from './ui/TaskSkeleton';
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger';
import ErrorMessage from './ui/ErrorMessage';
import ConfirmDialog from './ui/ConfirmDialog';
import DashboardHeader from './DashboardHeader';
import TaskFilters from './TaskFilters';
import { EmptyState } from './ui/EmptyState';
import { useTranslation } from 'react-i18next';
import { useTaskBoard } from '@/hooks/useTaskBoard';
import { LayoutGrid, List } from 'lucide-react';
import { TooltipSimple } from './ui/Tooltip';
import { cn } from '@/lib/utils';
import { AppLayout } from './AppLayout';

export default function TaskBoard() {
  const { t } = useTranslation();
  
  const {
    tasks,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    viewMode,
    filters,
    searchTerm,
    isFormOpen,
    isProfileOpen,
    profileTab,
    editingTask,
    deletingId,
    isDeleting,
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
  } = useTaskBoard();

  return (
    <AppLayout
      totalTasks={total}
      onProfileOpen={handleProfileOpen}
      isProfileOpen={isProfileOpen}
      onProfileClose={handleProfileClose}
      profileTab={profileTab}
    >
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
        onNewTask={handleNewTask}
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
        <EmptyState
          title={t('tasks.no_tasks')}
          description={searchTerm || filters.status || filters.priority ? t('tasks.no_tasks_match') : t('tasks.get_started')}
          action={!(searchTerm || filters.status || filters.priority) ? {
            label: t('tasks.new_task'),
            onClick: handleNewTask
          } : undefined}
        />
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editingTask={editingTask}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        message={t('tasks.confirm_delete')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </AppLayout>
  );
}
