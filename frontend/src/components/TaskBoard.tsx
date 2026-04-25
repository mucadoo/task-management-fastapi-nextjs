"use client";
import { useState, useCallback } from "react";
import { PaginatedResponse, Task, TaskCreate, TaskStatus } from "../types/task";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import Pagination from "./Pagination";
import LoadingSpinner from "./ui/LoadingSpinner";
import ErrorMessage from "./ui/ErrorMessage";
import ConfirmDialog from "./ui/ConfirmDialog";
interface TaskBoardProps {
  initialData: PaginatedResponse<Task>;
}
export default function TaskBoard({ initialData }: TaskBoardProps) {
  const [data, setData] = useState(initialData);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const router = useRouter();
  const handleLogout = () => {
    api.logout();
    router.push("/login");
    router.refresh();
  };
  const refetch = useCallback(async (page = data.page, status = statusFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const newData = await api.getTasks({
        page,
        page_size: data.page_size,
        status,
      });
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }, [data.page, data.page_size, statusFilter]);
  const handleStatusChange = (status: TaskStatus | undefined) => {
    setStatusFilter(status);
    refetch(1, status);
  };
  const handlePageChange = (newPage: number) => {
    refetch(newPage);
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
      setIsLoading(true);
      try {
        await api.deleteTask(deletingId);
        setDeletingId(null);
        refetch();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete task");
        setIsLoading(false);
      }
    }
  };
  const tabs: { label: string; value: TaskStatus | undefined }[] = [
    { label: "All", value: undefined },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize and track your work efficiently.
          </p>
        </div>
        <div className="flex gap-2">
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
            New Task
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleStatusChange(tab.value)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${statusFilter === tab.value
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
              `}
            >
              {tab.label}
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
                isDeleting={deletingId === task.id}
              />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={Math.ceil(data.total / data.page_size)}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter ? "No tasks match this filter." : "Get started by creating a new task."}
          </p>
          {!statusFilter && (
            <div className="mt-6">
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create Task
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
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
        isLoading={isLoading}
      />
    </div>
  );
}
