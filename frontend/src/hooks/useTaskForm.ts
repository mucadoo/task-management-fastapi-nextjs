'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, TaskCreate } from '@/types/task';
import { useCreateTask, useUpdateTask } from './useTasks';
import { useTranslation } from 'react-i18next';
import { getTaskSchema } from '@/lib/validations';
import { notify } from '@/lib/notifications';
import * as z from 'zod';

interface UseTaskFormProps {
  editingTask: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function useTaskForm({ editingTask, onClose }: UseTaskFormProps) {
  const { t } = useTranslation();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  const isSubmitting = createTaskMutation.isPending || updateTaskMutation.isPending;

  const schema = getTaskSchema(t);
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: editingTask
      ? {
          title: editingTask.title,
          description: editingTask.description || '',
          status: editingTask.status,
          priority: editingTask.priority,
          due_date: editingTask.due_date ? new Date(editingTask.due_date) : null,
          due_date_has_time: editingTask.due_date_has_time || false,
        }
      : {
          title: '',
          description: '',
          status: 'pending',
          priority: 'medium',
          due_date: null,
          due_date_has_time: false,
        },
  });

  const { handleSubmit } = form;

  const onFormSubmit = async (data: FormData) => {
    try {
      const finalDueDate = data.due_date instanceof Date
        ? data.due_date.toISOString()
        : data.due_date;

      const taskData = {
        ...data,
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        due_date: (finalDueDate as unknown as string) || undefined,
      };

      if (editingTask) {
        await updateTaskMutation.mutateAsync({ id: editingTask.id, data: taskData });
      } else {
        await createTaskMutation.mutateAsync(taskData as TaskCreate);
      }
      onClose();
    } catch (err) {
      notify.error(err, editingTask ? 'tasks.update_failed' : 'tasks.create_failed');
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit: handleSubmit(onFormSubmit),
  };
}
