'use client';
import { useEffect } from 'react';
import { Task, TaskCreate } from '../types/task';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
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
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Label } from './ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select';

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
            <Label htmlFor="title">
              {t('common.title')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={t('tasks.placeholder_title')}
              disabled={isSubmitting}
              className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium">{errors.title.message as string}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('tasks.description')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={3}
              className="resize-none"
              placeholder={t('tasks.placeholder_description')}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">{t('tasks.status')}</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder={t('tasks.status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('tasks.pending')}</SelectItem>
                      <SelectItem value="in_progress">{t('tasks.in_progress')}</SelectItem>
                      <SelectItem value="completed">{t('tasks.completed')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">{t('tasks.priority')}</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder={t('tasks.priority')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('tasks.low')}</SelectItem>
                      <SelectItem value="medium">{t('tasks.medium')}</SelectItem>
                      <SelectItem value="high">{t('tasks.high')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('tasks.due_date')}</Label>
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
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="text-primary-foreground" />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingTask ? t('tasks.edit_task') : t('tasks.create_task')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
