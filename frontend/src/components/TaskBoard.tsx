"use client";
import { useState, useCallback, useEffect } from "react";
import { PaginatedResponse, Task, TaskCreate, TaskStatus, TaskPriority } from "../types/task";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import TaskSkeleton from "./ui/TaskSkeleton";
import { InfiniteScrollTrigger } from "./InfiniteScrollTrigger";
import ErrorMessage from "./ui/ErrorMessage";
import ConfirmDialog from "./ui/ConfirmDialog";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import ProfileModal from "./ProfileModal";
import UserMenu from "./UserMenu";
import { useTranslation } from "react-i18next";
import { Plus, Search, LayoutGrid, List, Clock, AlertCircle, CheckSquare as CheckSquareIcon, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipSimple } from "./ui/Tooltip";

interface TaskBoardProps {
  initialData: PaginatedResponse<Task>;
}

export default function TaskBoard({ initialData }: TaskBoardProps) {
  const { t } = useTranslation();
  const [data, setData] = useState(initialData);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'personal' | 'security'>('personal');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const router = useRouter();

  const handleLogout = () => {
    api.logout();
    router.push("/login");
    router.refresh();
  };

  const refetch = useCallback(async (page = 1, status = statusFilter, priority = priorityFilter, q = debouncedSearchTerm, append = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const newData = await api.getTasks({
        page,
        page_size: data.page_size,
        status,
        priority,
        q: q || undefined,
      });
      if (append) {
        setData(prev => ({
          ...newData,
          items: [...prev.items, ...newData.items]
        }));
      } else {
        setData(newData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsLoading(false);
    }
  }, [data.page_size, statusFilter, priorityFilter, debouncedSearchTerm, t]);

  useEffect(() => {
    refetch(1);
  }, [debouncedSearchTerm, statusFilter, priorityFilter]);

  const handlePriorityChange = (priority: TaskPriority | "all") => {
    const val = priority === "all" ? undefined : priority;
    setPriorityFilter(val);
  };

  const handleStatusChange = (status: TaskStatus | undefined) => {
    setStatusFilter(status);
  };

  const handleLoadMore = () => {
    const totalPages = Math.ceil(data.total / data.page_size);
    if (data.page < totalPages && !isLoading) {
      refetch(data.page + 1, statusFilter, priorityFilter, debouncedSearchTerm, true);
    }
  };

  const handleCreateTask = async (taskData: TaskCreate) => {
    await api.createTask(taskData);
  };

  const handleUpdateTask = async (taskData: TaskCreate) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, taskData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      const idToDelete = deletingId;
      const originalData = { ...data };

      setData(prev => ({
        ...prev,
        items: prev.items.filter(t => t.id !== idToDelete),
        total: prev.total - 1
      }));
      setDeletingId(null);

      try {
        await api.deleteTask(idToDelete);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error'));
        setData(originalData);
      }
    }
  };

  const handleToggleTask = async (id: string) => {
    const originalItems = [...data.items];
    const taskToToggle = originalItems.find(t => t.id === id);
    if (!taskToToggle) return;
    setTogglingId(id);
    const newStatus: TaskStatus = taskToToggle.status === "completed" ? "pending" : "completed";
    setData(prev => ({
      ...prev,
      items: prev.items.map(t => t.id === id ? { ...t, status: newStatus } : t)
    }));
    try {
      const updated = await api.toggleTaskStatus(id);
      setData(prev => ({
        ...prev,
        items: prev.items.map(t => t.id === id ? updated : t)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
      setData(prev => ({
        ...prev,
        items: originalItems
      }));
    } finally {
      setTogglingId(null);
    }
  };

  const tabs: { label: string; value: TaskStatus | undefined; translationKey: string; icon: any }[] = [
    { label: "All", value: undefined, translationKey: "tasks.all", icon: LayoutGrid },
    { label: "Pending", value: "pending", translationKey: "tasks.pending", icon: Clock },
    { label: "In Progress", value: "in_progress", translationKey: "tasks.in_progress", icon: AlertCircle },
    { label: "Completed", value: "completed", translationKey: "tasks.completed", icon: CheckSquareIcon },
  ];

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-[#0a0a0a]">
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-warm-200 dark:border-white/5 h-14 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mr-6">
          <div className="p-1.5 bg-brand-500 rounded"><CheckSquareIcon className="h-4 w-4 text-white" /></div>
          <span className="font-semibold text-sm text-warm-900 dark:text-gray-100">TaskFlow</span>
          <span className="mx-2 text-warm-300">·</span>
          <span className="text-xs text-warm-600 dark:text-gray-500">{t('tasks.tasks_count', { count: data.total })}</span>
        </div>
        <div className="flex-grow" />
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          <div className="w-px h-4 bg-warm-200 dark:bg-white/10 mx-1" />
          <UserMenu 
            onProfileOpen={(tab) => { setProfileTab(tab); setIsProfileOpen(true); }} 
            onLogout={handleLogout} 
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="rule-brand mb-4 w-8" />
            <h1 className="text-2xl font-bold text-warm-900 dark:text-gray-100 tracking-tight">
              {t('tasks.title')}
            </h1>
          </div>
          <div className="flex gap-1 p-1 bg-warm-100 dark:bg-white/5 rounded-lg border border-warm-200 dark:border-white/5">
            <TooltipSimple content={t('tasks.view_gallery')} side="bottom">
              <button 
                onClick={() => setViewMode('gallery')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'gallery' ? 'bg-white dark:bg-white/10 text-brand-500 shadow-sm' : 'text-warm-500 hover:text-warm-900'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </TooltipSimple>
            <TooltipSimple content={t('tasks.view_list')} side="bottom">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-white/10 text-brand-500 shadow-sm' : 'text-warm-500 hover:text-warm-900'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </TooltipSimple>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <div className="relative flex-[2]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 dark:text-gray-500" />
            <input 
              type="text" 
              placeholder={t('tasks.search')} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="h-10 w-full pl-9 pr-4 bg-white dark:bg-[#141414] border border-warm-200 dark:border-white/10 rounded-lg text-sm text-warm-900 dark:text-gray-100 placeholder:text-warm-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 transition-all"
            />
          </div>

          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <select 
                value={statusFilter || "all"} 
                onChange={(e) => handleStatusChange(e.target.value === "all" ? undefined : e.target.value as TaskStatus)} 
                className="h-10 w-full pl-3 pr-10 bg-white dark:bg-[#141414] border border-warm-200 dark:border-white/10 rounded-lg text-sm text-warm-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 transition-all cursor-pointer appearance-none"
              >
                {tabs.map((tab) => (
                  <option key={tab.translationKey} value={tab.value || "all"}>
                    {t(tab.translationKey)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
            </div>

            <div className="relative flex-1">
              <select 
                value={priorityFilter || "all"} 
                onChange={(e) => handlePriorityChange(e.target.value as any)} 
                className="h-10 w-full pl-3 pr-10 bg-white dark:bg-[#141414] border border-warm-200 dark:border-white/10 rounded-lg text-sm text-warm-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 transition-all cursor-pointer appearance-none"
              >
                <option value="all">{t('tasks.all_priorities')}</option>
                <option value="low">{t('tasks.low_priority')}</option>
                <option value="medium">{t('tasks.medium_priority')}</option>
                <option value="high">{t('tasks.high_priority')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
            </div>
          </div>

          <TooltipSimple content={t('tasks.new_task')} side="left">
            <button 
              onClick={() => { setEditingTask(null); setIsFormOpen(true); }} 
              className="h-10 w-10 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center justify-center transition-all active:scale-[0.98] shadow-sm shadow-brand-500/10 cursor-pointer"
            >
              <Plus className="h-5 w-5" />
            </button>
          </TooltipSimple>
        </div>

        {error && <div className="mb-6"><ErrorMessage message={error} /></div>}

        {isLoading && data.items.length === 0 ? (
          <div className={viewMode === 'gallery' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {[...Array(6)].map((_, i) => <TaskSkeleton key={i} />)}
          </div>
        ) : data.items.length > 0 ? (
          <>
            <div className={viewMode === 'gallery' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500" : "flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500"}>
              {data.items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  viewMode={viewMode}
                  onEdit={(t) => { setEditingTask(t); setIsFormOpen(true); }}
                  onDelete={(id) => setDeletingId(id)}
                  onToggle={handleToggleTask}
                  isDeleting={deletingId === task.id}
                  isToggling={togglingId === task.id}
                />
              ))}
            </div>
            <InfiniteScrollTrigger onIntersect={handleLoadMore} isLoading={isLoading} hasMore={data.page < Math.ceil(data.total / data.page_size)} />
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-warm-300 dark:border-white/5 rounded-xl text-warm-600 dark:text-gray-500">
            {t('tasks.no_tasks')}
          </div>
        )}

        <TaskForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingTask(null); }} onSuccess={refetch} editingTask={editingTask} onSubmit={editingTask ? handleUpdateTask : handleCreateTask} />
        <ConfirmDialog isOpen={deletingId !== null} message={t('tasks.confirm_delete')} onConfirm={handleDeleteConfirm} onCancel={() => setDeletingId(null)} isLoading={isLoading} />
        <ProfileModal 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          onLogout={handleLogout} 
          initialTab={profileTab}
        />
      </main>
    </div>
  );
}
