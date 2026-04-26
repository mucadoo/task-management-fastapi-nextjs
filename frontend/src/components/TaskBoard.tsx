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
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/Tooltip';
import { Button } from './ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select';
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

  const handlePriorityChange = (value: string) => {
    setFilters({ priority: value === 'all' ? undefined : (value as TaskPriority) });
  };

  const handleStatusChange = (value: string) => {
    setFilters({ status: value === 'all' ? undefined : (value as TaskStatus) });
  };

  const handleSortChange = (value: string) => {
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
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b h-14 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mr-6">
          <div className="p-1.5 bg-primary rounded">
            <CheckSquareIcon className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">TaskFlow</span>
          <span className="mx-2 text-muted-foreground/30">·</span>
          <span className="text-xs text-muted-foreground">
            {t('tasks.tasks_count', { count: total })}
          </span>
        </div>
        <div className="flex-grow" />
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          <div className="w-px h-4 bg-border mx-1" />
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
            <h1 className="text-2xl font-bold tracking-tight">
              {t('tasks.title')}
            </h1>
          </div>
          
          <div className="flex gap-1 p-1 bg-muted rounded-lg border border-border/50">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'gallery' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('gallery')}
                    className={cn("h-8 w-8 rounded-md transition-all", viewMode === 'gallery' && "bg-background shadow-sm")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{t('tasks.view_gallery')}</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={cn("h-8 w-8 rounded-md transition-all", viewMode === 'list' && "bg-background shadow-sm")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{t('tasks.view_list')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <SearchInput
            placeholder={t('tasks.search')}
            value={searchTerm}
            onChange={setSearchTerm}
            className="flex-[2]"
          />
          <div className="flex flex-1 items-center gap-3">
            <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t('tasks.status')} />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    {t(tab.translationKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.priority || 'all'} onValueChange={handlePriorityChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t('tasks.priority')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasks.all_priorities')}</SelectItem>
                <SelectItem value="low">{t('tasks.low_priority')}</SelectItem>
                <SelectItem value="medium">{t('tasks.medium_priority')}</SelectItem>
                <SelectItem value="high">{t('tasks.high_priority')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 hidden lg:block">
              {t('tasks.sort_by')}
            </span>
            <Select 
              value={`${filters.sort_by || 'due_date'}-${filters.sort_dir || 'asc'}`} 
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('tasks.sort_by')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_date-asc">{t('tasks.sort_due')} (↑)</SelectItem>
                <SelectItem value="due_date-desc">{t('tasks.sort_due')} (↓)</SelectItem>
                <SelectItem value="created_at-desc">{t('tasks.sort_created')} (↓)</SelectItem>
                <SelectItem value="created_at-asc">{t('tasks.sort_created')} (↑)</SelectItem>
                <SelectItem value="priority-desc">{t('tasks.sort_priority')} (↓)</SelectItem>
                <SelectItem value="priority-asc">{t('tasks.sort_priority')} (↑)</SelectItem>
                <SelectItem value="title-asc">{t('tasks.sort_title')} (A-Z)</SelectItem>
                <SelectItem value="title-desc">{t('tasks.sort_title')} (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingTask(null);
                    setIsFormOpen(true);
                  }}
                  size="icon"
                  className="h-10 w-10 shrink-0"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">{t('tasks.new_task')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          <div className="text-center py-20 border border-dashed rounded-xl text-muted-foreground">
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
