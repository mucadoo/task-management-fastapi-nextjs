'use client';
import { useEffect, useState } from 'react';
import { Task, TaskCreate } from '../types/task';
import { useTranslation } from 'react-i18next';
import { X, ChevronDown, Save } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ErrorMessage from './ui/ErrorMessage';
import LoadingSpinner from './ui/LoadingSpinner';
import { DateTimePicker } from './ui/DateTimePicker';
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.date().optional().nullable(),
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
    control,
  } = useForm<TaskCreate & { due_date: Date | null }>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      due_date: null,
      due_date_has_time: false,
    },
  });
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (editingTask) {
        reset({
          title: editingTask.title,
          description: editingTask.description || '',
          status: editingTask.status,
          priority: editingTask.priority,
          due_date: editingTask.due_date ? new Date(editingTask.due_date) : null,
          due_date_has_time: editingTask.due_date_has_time || false,
        });
      } else {
        reset({
          title: '',
          description: '',
          status: 'pending',
          priority: 'medium',
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
  const onFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      let finalDueDate = data.due_date;
      if (finalDueDate) {
        finalDueDate = finalDueDate.toISOString();
      }
      await onSubmit({
        ...data,
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        due_date: finalDueDate || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card-surface w-full max-w-md p-6 space-y-5">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-warm-900 dark:text-white">
              {editingTask ? t('tasks.edit_task') : t('tasks.new_task')}
            </h2>
            <div className="rule-brand" />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-warm-100 dark:hover:bg-warm-900 rounded-lg transition-colors cursor-pointer"
          >
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
            {errors.title && (
              <p className="text-[10px] text-red-500 ml-1">{errors.title.message as string}</p>
            )}
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
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-warm-600 dark:text-warm-400 ml-0.5">
              {t('tasks.due_date')}
            </label>
            <Controller
              control={control}
              name="due_date"
              render={({ field }) => (
                <DateTimePicker
                  date={field.value}
                  setDate={field.onChange}
                  hasTime={watch('due_date_has_time')}
                  setHasTime={(val) => setValue('due_date_has_time', val)}
                />
              )}
            />
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
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editingTask ? t('tasks.edit_task') : t('tasks.create_task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
