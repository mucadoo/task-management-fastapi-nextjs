"use client";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { PaginatedResponse, Task, TaskCreate, TaskStatus, TaskPriority } from "../types/task";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";
import { useDebounce } from "../hooks/useDebounce";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import { InfiniteScrollTrigger } from "./InfiniteScrollTrigger";
import LoadingSpinner from "./ui/LoadingSpinner";
import ErrorMessage from "./ui/ErrorMessage";
import ConfirmDialog from "./ui/ConfirmDialog";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "react-i18next";

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

  const tabs: { label: string; value: TaskStatus | undefined; translationKey: string }[] = [
    { label: "All", value: undefined, translationKey: "tasks.all" },
    { label: "Pending", value: "pending", translationKey: "tasks.pending" },
    { label: "In Progress", value: "in_progress", translationKey: "tasks.in_progress" },
    { label: "Completed", value: "completed", translationKey: "tasks.completed" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex-grow max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder={t('tasks.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={priorityFilter || "all"}
            onChange={(e) => handlePriorityChange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="all">{t('tasks.all_priorities')}</option>
            <option value="low">{t('tasks.low_priority')}</option>
            <option value="medium">{t('tasks.medium_priority')}</option>
            <option value="high">{t('tasks.high_priority')}</option>
          </select>
          <button
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('tasks.new_task')}
          </button>
          <Link
            href="/profile"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {t('common.profile')}
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {t('common.logout')}
          </button>
          <div className="flex items-center space-x-2 ml-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.translationKey}
              onClick={() => handleStatusChange(tab.value)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${statusFilter === tab.value
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"}
              `}
            >
              {t(tab.translationKey)}
            </button>
          ))}
        </nav>
      </div>
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}
      {isLoading && data.items.length === 0 ? (
        <div className="py-20">
          <LoadingSpinner />
        </div>
      ) : data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsFormOpen(true);
                }}
                onDelete={(id) => setDeletingId(id)}
                onToggle={handleToggleTask}
                isDeleting={deletingId === task.id}
                isToggling={togglingId === task.id}
              />
            ))}
          </div>
          <InfiniteScrollTrigger
            onIntersect={handleLoadMore}
            isLoading={isLoading}
            hasMore={data.page < Math.ceil(data.total / data.page_size)}
          />
        </>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{t('tasks.no_tasks')}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {statusFilter ? t('tasks.no_tasks_match') : t('tasks.get_started')}
          </p>
          {!statusFilter && (
            <div className="mt-6">
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {t('tasks.new_task')}
              </button>
            </div>
          )}
        </div>
      )}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSuccess={refetch}
        editingTask={editingTask}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
      />
      <ConfirmDialog
        isOpen={deletingId !== null}
        message={t('tasks.confirm_delete')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
        isLoading={isLoading}
      />
    </div>
  );
}
