"use client";
import { useState, useCallback, useEffect } from "react";
import { PaginatedResponse, Task, TaskCreate, TaskStatus, TaskPriority } from "../types/task";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";
import { useDebounce } from "../hooks/useDebounce";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import TaskSkeleton from "./ui/TaskSkeleton";
import { InfiniteScrollTrigger } from "./InfiniteScrollTrigger";
import ErrorMessage from "./ui/ErrorMessage";
import ConfirmDialog from "./ui/ConfirmDialog";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import ProfileModal from "./ProfileModal";
import { useTranslation } from "react-i18next";
import { Plus, Search, Filter, LayoutGrid, CheckSquare, Clock, AlertCircle, CheckSquare as CheckSquareIcon } from "lucide-react";

interface TaskBoardProps {
  initialData: PaginatedResponse<Task>;
}

export default function TaskBoard({ initialData }: TaskBoardProps) {
  const { t } = useTranslation();
  const [data, setData] = useState(initialData);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
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
    <div className="min-h-screen bg-warm-50 dark:bg-[#0f0d0c]">
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-[#0f0d0c]/90 backdrop-blur-md border-b border-warm-200 dark:border-warm-800/60 h-14 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mr-6">
          <div className="p-1.5 bg-brand-600 rounded-lg"><CheckSquareIcon className="h-5 w-5 text-white" /></div>
          <span className="font-bold text-warm-900 dark:text-white">TaskFlow</span>
          <span className="ml-2 bg-warm-100 dark:bg-warm-900 text-warm-600 dark:text-warm-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{data.total}</span>
        </div>
        <div className="flex-grow" />
        <div className="flex items-center gap-2">
          <button onClick={() => setIsProfileOpen(true)} className="px-4 py-2 text-sm font-semibold text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-900 rounded-xl">Profile</button>
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <div className="rule-brand w-10 mb-3" />
          <h1 className="text-3xl font-extrabold text-warm-900 dark:text-white tracking-tight">
            {t('tasks.title')}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2 p-1 bg-warm-100 dark:bg-warm-900/40 rounded-xl w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.translationKey}
                  onClick={() => handleStatusChange(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${active ? "bg-white dark:bg-[#1a1714] text-brand-600 shadow-sm border border-warm-200 dark:border-warm-800" : "text-warm-600 dark:text-warm-400"}`}
                >
                  <Icon className="h-4 w-4" />
                  {t(tab.translationKey)}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
            className="btn-primary"
          >
            <Plus className="h-5 w-5" />
            {t('tasks.new_task')}
          </button>
        </div>

        <div className="card-surface p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <input
              type="text"
              placeholder={t('tasks.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-base"
            />
            <select
              value={priorityFilter || "all"}
              onChange={(e) => handlePriorityChange(e.target.value as any)}
              className="input-base lg:w-48"
            >
              <option value="all">{t('tasks.all_priorities')}</option>
              <option value="low">{t('tasks.low_priority')}</option>
              <option value="medium">{t('tasks.medium_priority')}</option>
              <option value="high">{t('tasks.high_priority')}</option>
            </select>
          </div>
        </div>

        {error && <div className="mb-6"><ErrorMessage message={error} /></div>}

        {isLoading && data.items.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <TaskSkeleton key={i} />)}
          </div>
        ) : data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {data.items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
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
          <div className="text-center py-24 border-2 border-dashed border-warm-200 dark:border-warm-800 rounded-2xl">
            <LayoutGrid className="h-10 w-10 text-warm-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-warm-900 dark:text-white">{t('tasks.no_tasks')}</h3>
          </div>
        )}

        <TaskForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingTask(null); }} onSuccess={refetch} editingTask={editingTask} onSubmit={editingTask ? handleUpdateTask : handleCreateTask} />
        <ConfirmDialog isOpen={deletingId !== null} message={t('tasks.confirm_delete')} onConfirm={handleDeleteConfirm} onCancel={() => setDeletingId(null)} isLoading={isLoading} />
        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onLogout={handleLogout} />
      </main>
    </div>
  );
}
