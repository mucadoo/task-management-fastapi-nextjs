'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskSkeleton from './ui/TaskSkeleton';
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger';
import ErrorMessage from './ui/ErrorMessage';
import ConfirmDialog from './ui/ConfirmDialog';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import ProfileModal from './ProfileModal';
import UserMenu from './UserMenu';
import SearchInput from './ui/SearchInput';
import { useTranslation } from 'react-i18next';
import { useTaskStore } from '../store/useTaskStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTasks, useDeleteTask } from '../hooks/useTasks';
import {
  Plus,
  LayoutGrid,
  List,
  Clock,
  AlertCircle,
  CheckSquare as CheckSquareIcon,
  ChevronDown,
} from 'lucide-react';
import { TooltipSimple } from './ui/Tooltip';
import { cn } from '../lib/utils';

export default function TaskBoard() {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    viewMode,
    setViewMode,
    filters,
    setFilters,
  } = useTaskStore();

  const { logout } = useAuthStore();
  
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

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({ priority: value === 'all' ? undefined : (value as TaskPriority) });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({ status: value === 'all' ? undefined : (value as TaskStatus) });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [sortBy, sortDir] = value.split('-');
    setFilters({ sort_by: sortBy, sort_dir: sortDir });
  };

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

  const tabs: {
    label: string;
    value: string;
    translationKey: string;
    icon: any;
  }[] = [
    { label: 'All', value: 'all', translationKey: 'tasks.status_all', icon: LayoutGrid },
    { label: 'Pending', value: 'pending', translationKey: 'tasks.pending', icon: Clock },
    {
      label: 'In Progress',
      value: 'in_progress',
      translationKey: 'tasks.in_progress',
      icon: AlertCircle,
    },
    {
      label: 'Completed',
      value: 'completed',
      translationKey: 'tasks.completed',
      icon: CheckSquareIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-[#0a0a0a]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-warm-200 dark:border-white/5 h-14 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mr-6">
          <div className="p-1.5 bg-brand-500 rounded">
            <CheckSquareIcon className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-warm-900 dark:text-gray-100">TaskFlow</span>
          <span className="mx-2 text-warm-200 dark:text-white/10">·</span>
          <span className="text-xs text-warm-600 dark:text-gray-500">
            {t('tasks.tasks_count', { count: total })}
          </span>
        </div>
        <div className="flex-grow" />
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          <div className="w-px h-4 bg-warm-200 dark:bg-white/10 mx-1" />
          <UserMenu
            onProfileOpen={(tab) => {
              setProfileTab(tab);
              setIsProfileOpen(true);
            }}
          />
        </div>
      </div>

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

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <div className="flex-[2]">
            <SearchInput
              placeholder={t('tasks.search')}
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <select 
                value={filters.status || 'all'} 
                onChange={handleStatusChange}
                className="h-10 w-full pl-3 pr-10 bg-white dark:bg-[#141414] border border-warm-200 dark:border-white/10 rounded-lg text-sm text-warm-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 appearance-none cursor-pointer"
              >
                {tabs.map((tab) => (
                  <option key={tab.value} value={tab.value}>
                    {t(tab.translationKey)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
            </div>

            <div className="relative flex-1">
              <select 
                value={filters.priority || 'all'} 
                onChange={handlePriorityChange}
                className="h-10 w-full pl-3 pr-10 bg-white dark:bg-[#141414] border border-warm-200 dark:border-white/10 rounded-lg text-sm text-warm-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 appearance-none cursor-pointer"
              >
                <option value="all">{t('tasks.all_priorities')}</option>
                <option value="low">{t('tasks.low_priority')}</option>
                <option value="medium">{t('tasks.medium_priority')}</option>
                <option value="high">{t('tasks.high_priority')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="text-[10px] font-bold text-warm-500 dark:text-gray-500 uppercase tracking-widest ml-1 hidden lg:block">
              {t('tasks.sort_by')}
            </span>
            <div className="relative w-[180px]">
              <select 
                value={`${filters.sort_by || 'due_date'}-${filters.sort_dir || 'asc'}`} 
                onChange={handleSortChange}
                className="h-10 w-full pl-3 pr-10 bg-white dark:bg-[#141414] border border-warm-200 dark:border-white/10 rounded-lg text-sm text-warm-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 appearance-none cursor-pointer"
              >
                <option value="due_date-asc">{t('tasks.sort_due')} (↑)</option>
                <option value="due_date-desc">{t('tasks.sort_due')} (↓)</option>
                <option value="created_at-desc">{t('tasks.sort_created')} (↓)</option>
                <option value="created_at-asc">{t('tasks.sort_created')} (↑)</option>
                <option value="priority-desc">{t('tasks.sort_priority')} (↓)</option>
                <option value="priority-asc">{t('tasks.sort_priority')} (↑)</option>
                <option value="title-asc">{t('tasks.sort_title')} (A-Z)</option>
                <option value="title-desc">{t('tasks.sort_title')} (Z-A)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
            </div>
          </div>

          <TooltipSimple content={t('tasks.new_task')} side="left">
            <button
              onClick={() => {
                setEditingTask(null);
                setIsFormOpen(true);
              }}
              className="h-10 w-10 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center justify-center shadow-sm shadow-brand-500/10 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </TooltipSimple>
        </div>

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

        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          initialTab={profileTab}
        />
      </main>
    </div>
  );
}
