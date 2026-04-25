"use client";
import { useState, useEffect } from "react";
import { Task, TaskCreate, TaskStatus, TaskPriority } from "../types/task";
import { useTranslation } from "react-i18next";
import { X, Save, AlertCircle, ChevronDown } from "lucide-react";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTask: Task | null;
  onSubmit: (data: TaskCreate) => Promise<void>;
}

export default function TaskForm({
  isOpen,
  onClose,
  onSuccess,
  editingTask,
  onSubmit,
}: TaskFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
    } else {
      setTitle("");
      setDescription("");
      setStatus("pending");
      setPriority("medium");
    }
    setError(null);
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t('common.error_required', { field: 'Title' }));
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#1a1714] rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-warm-200 dark:border-warm-800">
        <div className="flex items-center justify-between p-5 border-b border-warm-100 dark:border-warm-800">
          <h2 className="text-lg font-semibold text-warm-900 dark:text-white">
            {editingTask ? t('tasks.edit_task') : t('tasks.new_task')}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 text-warm-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium border border-red-100 dark:border-red-900/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wider">
              {t('common.title')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-base h-11"
              placeholder={t('tasks.placeholder_title')}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wider">
              {t('tasks.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-base py-3 resize-none min-h-[100px]"
              placeholder={t('tasks.placeholder_description')}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wider">
                {t('tasks.status')}
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="input-base h-11 appearance-none pr-10 cursor-pointer"
                  disabled={isSubmitting}
                >
                  <option value="pending">{t('tasks.pending')}</option>
                  <option value="in_progress">{t('tasks.in_progress')}</option>
                  <option value="completed">{t('tasks.completed')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1.5 uppercase tracking-wider">
                {t('tasks.priority')}
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="input-base h-11 appearance-none pr-10 cursor-pointer"
                  disabled={isSubmitting}
                >
                  <option value="low">{t('tasks.low')}</option>
                  <option value="medium">{t('tasks.medium')}</option>
                  <option value="high">{t('tasks.high')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-11 text-sm font-semibold text-warm-700 dark:text-warm-300 bg-warm-100 dark:bg-warm-800 rounded-lg hover:bg-warm-200 dark:hover:bg-warm-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[1.5] h-11 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-sm shadow-brand-700/10 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Save className="h-4 w-4" />}
              {editingTask ? t('tasks.edit_task') : t('tasks.create_task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
