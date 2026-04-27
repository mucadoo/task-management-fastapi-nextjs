'use client';
import React from 'react';
import { Task } from '../types/task';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import { Controller } from 'react-hook-form';
import LoadingSpinner from './ui/LoadingSpinner';
import { DateTimePicker } from './ui/DateTimePicker';
import { useTaskForm } from '../hooks/useTaskForm';
import { FormControl } from './ui/FormControl';
import { Select } from './ui/Select';
import { getStatusOptions, getPriorityOptions } from '../lib/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/Dialog';
import { cn } from '../lib/utils';

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
  
  const { 
    form: { register, control, watch, setValue, formState: { errors } }, 
    isSubmitting, 
    onSubmit 
  } = useTaskForm({ editingTask, isOpen, onClose });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? t('tasks.edit_task') : t('tasks.new_task')}
          </DialogTitle>
          <div className="rule-brand w-8 h-1" />
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <FormControl id="title" label={t('common.title')} error={errors.title?.message} required>
            <input
              id="title"
              {...register('title')}
              placeholder={t('tasks.placeholder_title')}
              disabled={isSubmitting}
              className={cn("input-base", errors.title && "border-red-500 focus:ring-red-500/20")}
            />
          </FormControl>

          <FormControl id="description" label={t('tasks.description')} error={errors.description?.message}>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="input-base resize-none"
              placeholder={t('tasks.placeholder_description')}
              disabled={isSubmitting}
            />
          </FormControl>

          <div className="grid grid-cols-2 gap-4">
            <FormControl id="status" label={t('tasks.status')}>
              <Select
                id="status"
                {...register('status')}
                disabled={isSubmitting}
                options={getStatusOptions(t)}
              />
            </FormControl>

            <FormControl id="priority" label={t('tasks.priority')}>
              <Select
                id="priority"
                {...register('priority')}
                disabled={isSubmitting}
                options={getPriorityOptions(t)}
              />
            </FormControl>
          </div>

          <FormControl label={t('tasks.due_date')}>
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
          </FormControl>

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
