'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, TaskCreate } from '@/types/task';
import { useCreateTask, useUpdateTask } from './useTasks';
import { useTranslation } from 'react-i18next';
import { getTaskSchema } from '@/lib/validations';

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

  const form = useForm<TaskCreate & { due_date: Date | null }>({
    resolver: zodResolver(getTaskSchema(t)) as any,
    values: editingTask
      ? {
          title: editingTask.title,
          description: editingTask.description || '',
          status: editingTask.status,
          priority: editingTask.priority,
          due_date: (editingTask.due_date ? new Date(editingTask.due_date) : null) as any,
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
    } catch {

    }
  };

  return {
    form,
    isSubmitting,
    onSubmit: handleSubmit(onFormSubmit),
  };
}
