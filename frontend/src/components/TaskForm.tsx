'use client';
import React from 'react';
import { Task } from '../types/task';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { DateTimePicker } from './ui/DateTimePicker';
import { useTaskForm } from '../hooks/useTaskForm';
import { FormField } from './ui/FormField';
import { FormControl } from './ui/FormControl';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { getStatusOptions, getPriorityOptions } from '../lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/Dialog';
import { cn } from '../lib/utils';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: Task | null;
}

export default function TaskForm({ isOpen, onClose, editingTask }: TaskFormProps) {
  const { t } = useTranslation();

  const {
    form: {
      register,
      control,
      watch,
      setValue,
      formState: { errors },
    },
    isSubmitting,
    onSubmit,
  } = useTaskForm({ editingTask, isOpen, onClose });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingTask ? t('tasks.edit_task') : t('tasks.new_task')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <FormField name="title" label={t('common.title')} error={errors.title?.message} required>
            <Input
              {...register('title')}
              placeholder={t('tasks.placeholder_title')}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            name="description"
            label={t('tasks.description')}
            error={errors.description?.message}
          >
            <Textarea
              {...register('description')}
              placeholder={t('tasks.placeholder_description')}
              disabled={isSubmitting}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField name="status" label={t('tasks.status')}>
              <Select
                {...register('status')}
                disabled={isSubmitting}
                options={getStatusOptions(t)}
              />
            </FormField>

            <FormField name="priority" label={t('tasks.priority')}>
              <Select
                {...register('priority')}
                disabled={isSubmitting}
                options={getPriorityOptions(t)}
              />
            </FormField>
          </div>

          <FormControl label={t('tasks.due_date')} id="due_date">
            <Controller
              control={control}
              name="due_date"
              render={({ field }) => (
                <DateTimePicker
                  date={field.value}
                  setDate={field.onChange}
                  hasTime={watch('due_date_has_time') || false}
                  setHasTime={(val) => setValue('due_date_has_time', val)}
                />
              )}
            />
          </FormControl>

          <DialogFooter>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="min-w-[120px]"
              leftIcon={<Save className="h-4 w-4" />}
            >
              {editingTask ? t('tasks.edit_task') : t('tasks.create_task')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
