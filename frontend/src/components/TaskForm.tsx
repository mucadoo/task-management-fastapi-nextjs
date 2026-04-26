"use client";
import { useEffect, useState } from "react";
import { Task, TaskCreate, TaskStatus, TaskPriority } from "../types/task";
import { useTranslation } from "react-i18next";
import { X, Save, ChevronDown } from "lucide-react";
import LoadingSpinner from "./ui/LoadingSpinner";
import ErrorMessage from "./ui/ErrorMessage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().optional().nullable(),
  due_date_has_time: z.boolean().default(false),
});

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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskCreate & { has_due_date?: boolean }>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      due_date: null,
      due_date_has_time: false,
    },
  });

  const due_date_has_time = watch("due_date_has_time");
  const due_date = watch("due_date");
  const [hasDueDate, setHasDueDate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (editingTask) {
        setHasDueDate(!!editingTask.due_date);
        reset({
          title: editingTask.title,
          description: editingTask.description || "",
          status: editingTask.status,
          priority: editingTask.priority,
          due_date: editingTask.due_date ? (() => {
            const d = new Date(editingTask.due_date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            if (editingTask.due_date_has_time) {
              const hours = String(d.getHours()).padStart(2, '0');
              const minutes = String(d.getMinutes()).padStart(2, '0');
              return `${year}-${month}-${day}T${hours}:${minutes}`;
            }
            return `${year}-${month}-${day}`;
          })() : null,
          due_date_has_time: editingTask.due_date_has_time || false,
        });
      } else {
        setHasDueDate(false);
        reset({
          title: "",
          description: "",
          status: "pending",
          priority: "medium",
          due_date: null,
          due_date_has_time: false,
        });
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    setError(null);
  }, [editingTask, isOpen, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: TaskCreate) => {
    setIsSubmitting(true);
    setError(null);
    try {
      let finalDueDate = data.due_date;
      if (!hasDueDate) {
        finalDueDate = undefined;
      } else if (finalDueDate) {
        // Ensure it's in ISO format
        const date = new Date(finalDueDate);
        if (isNaN(date.getTime())) {
          finalDueDate = undefined;
        } else {
          finalDueDate = date.toISOString();
        }
      }

      await onSubmit({
        ...data,
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        due_date: finalDueDate || undefined,
        due_date_has_time: hasDueDate ? data.due_date_has_time : false,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="card-surface w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-warm-900 dark:text-white">
              {editingTask ? t('tasks.edit_task') : t('tasks.new_task')}
            </h2>
            <div className="rule-brand" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-warm-100 dark:hover:bg-warm-900 rounded-lg transition-colors cursor-pointer">
            <X className="h-5 w-5 text-warm-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {error && <ErrorMessage message={error} />}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-warm-600 dark:text-warm-400 ml-0.5">
              {t('common.title')} <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              className={`input-base ${errors.title ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder={t('tasks.placeholder_title')}
              disabled={isSubmitting}
            />
            {errors.title && <p className="text-[10px] text-red-500 ml-1">{errors.title.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-warm-600 dark:text-warm-400 ml-0.5">
              {t('tasks.description')}
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-base py-2.5 resize-none"
              placeholder={t('tasks.placeholder_description')}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-warm-600 dark:text-warm-400 ml-0.5">
                {t('tasks.status')}
              </label>
              <div className="relative">
                <select
                  {...register('status')}
                  className="input-base appearance-none pr-10 cursor-pointer"
                  disabled={isSubmitting}
                >
                  <option value="pending">{t('tasks.pending')}</option>
                  <option value="in_progress">{t('tasks.in_progress')}</option>
                  <option value="completed">{t('tasks.completed')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-warm-600 dark:text-warm-400 ml-0.5">
                {t('tasks.priority')}
              </label>
              <div className="relative">
                <select
                  {...register('priority')}
                  className="input-base appearance-none pr-10 cursor-pointer"
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

          <div className="space-y-3 p-3 bg-warm-50 dark:bg-warm-900/50 rounded-xl border border-warm-100 dark:border-warm-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-warm-700 dark:text-warm-300">
                {t('tasks.add_due_date')}
              </label>
              <input
                type="checkbox"
                checked={hasDueDate}
                onChange={(e) => {
                  setHasDueDate(e.target.checked);
                  if (e.target.checked && !due_date) {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    setValue("due_date", `${year}-${month}-${day}`);
                  }
                }}
                className="h-4 w-4 rounded border-warm-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            {hasDueDate && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-warm-500 uppercase tracking-wider">
                    {t('tasks.include_time')}
                  </label>
                  <input
                    {...register('due_date_has_time')}
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-warm-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setValue("due_date_has_time", checked);
                      if (due_date) {
                        if (checked) {
                          // date -> datetime-local (add 12:00)
                          setValue("due_date", `${due_date.slice(0, 10)}T12:00`);
                        } else {
                          // datetime-local -> date
                          setValue("due_date", due_date.slice(0, 10));
                        }
                      }
                    }}
                  />
                </div>
                <input
                  {...register('due_date')}
                  type={due_date_has_time ? "datetime-local" : "date"}
                  className="input-base text-sm py-2"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 btn-ghost cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[1.5] btn-primary cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : <Save className="h-4 w-4" />}
              {editingTask ? t('tasks.edit_task') : t('tasks.create_task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
