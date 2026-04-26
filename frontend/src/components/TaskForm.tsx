'use client';
import { useEffect } from 'react';
import { Task, TaskCreate } from '../types/task';
import { useTranslation } from 'react-i18next';
import { Save, ChevronDown } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import LoadingSpinner from './ui/LoadingSpinner';
import { DateTimePicker } from './ui/DateTimePicker';
import { useCreateTask, useUpdateTask } from '../hooks/useTasks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/Dialog';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: Task | null;
}

export default function TaskForm({
  isOpen,
  onClose,
  editingTask,
}: TaskFormProps) {
  const { t } = useTranslation();
  
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  
  const isSubmitting = createTaskMutation.isPending || updateTaskMutation.isPending;

  const taskSchema = z.object({
    title: z.string().min(1, t('common.error_required', { field: t('common.title') })),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']),
    priority: z.enum(['low', 'medium', 'high']),
    due_date: z.date().optional().nullable(),
    due_date_has_time: z.boolean().default(false),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    clearErrors,
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
      clearErrors();
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
    }
  }, [editingTask, isOpen, reset, clearErrors]);

  const onFormSubmit = async (data: any) => {
    try {
      let finalDueDate = data.due_date;
      if (finalDueDate) {
        finalDueDate = finalDueDate.toISOString();
      }
      
      const taskData = {
        ...data,
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        due_date: finalDueDate || undefined,
      };

      if (editingTask) {
        await updateTaskMutation.mutateAsync({ id: editingTask.id, data: taskData });
      } else {
        await createTaskMutation.mutateAsync(taskData);
      }
      onClose();
    } catch (err: any) {
      // Error handled by the hooks via toasts
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? t('tasks.edit_task') : t('tasks.new_task')}
          </DialogTitle>
          <div className="rule-brand w-8 h-1" />
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
              {t('common.title')} <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              {...register('title')}
              placeholder={t('tasks.placeholder_title')}
              disabled={isSubmitting}
              className={`input-base ${errors.title ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 font-medium ml-1">{errors.title.message as string}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
              {t('tasks.description')}
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="input-base resize-none"
              placeholder={t('tasks.placeholder_description')}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                {t('tasks.status')}
              </label>
              <div className="relative">
                <select
                  id="status"
                  {...register('status')}
                  disabled={isSubmitting}
                  className="input-base appearance-none pr-10 cursor-pointer"
                >
                  <option value="pending">{t('tasks.pending')}</option>
                  <option value="in_progress">{t('tasks.in_progress')}</option>
                  <option value="completed">{t('tasks.completed')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="priority" className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
                {t('tasks.priority')}
              </label>
              <div className="relative">
                <select
                  id="priority"
                  {...register('priority')}
                  disabled={isSubmitting}
                  className="input-base appearance-none pr-10 cursor-pointer"
                >
                  <option value="low">{t('tasks.low')}</option>
                  <option value="medium">{t('tasks.medium')}</option>
                  <option value="high">{t('tasks.high')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-warm-500 ml-1">
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
          <DialogFooter className="pt-4 flex flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-ghost"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary min-w-[120px]"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingTask ? t('tasks.edit_task') : t('tasks.create_task')}
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
