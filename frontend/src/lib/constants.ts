import { TFunction } from 'i18next';
import { TaskStatus, TaskPriority } from '@/types/task';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export const getStatusOptions = (
  t: TFunction,
  includeAll = false,
): SelectOption<TaskStatus | 'all'>[] => {
  const options: SelectOption<TaskStatus>[] = [
    { value: 'pending', label: t('tasks.pending') },
    { value: 'in_progress', label: t('tasks.in_progress') },
    { value: 'completed', label: t('tasks.completed') },
  ];
  if (includeAll) {
    return [{ value: 'all', label: t('tasks.status_all') }, ...options];
  }
  return options;
};

export const getPriorityOptions = (
  t: TFunction,
  includeAll = false,
): SelectOption<TaskPriority | 'all'>[] => {
  const options: SelectOption<TaskPriority>[] = [
    { value: 'low', label: t('tasks.low') },
    { value: 'medium', label: t('tasks.medium') },
    { value: 'high', label: t('tasks.high') },
  ];
  if (includeAll) {
    return [{ value: 'all', label: t('tasks.all_priorities') }, ...options];
  }
  return options;
};

export const getSortOptions = (t: TFunction): SelectOption[] => [
  { value: 'due_date-asc', label: `${t('tasks.sort_due')} (↑)` },
  { value: 'due_date-desc', label: `${t('tasks.sort_due')} (↓)` },
  { value: 'created_at-desc', label: `${t('tasks.sort_created')} (↓)` },
  { value: 'created_at-asc', label: `${t('tasks.sort_created')} (↑)` },
  { value: 'priority-desc', label: `${t('tasks.sort_priority')} (↓)` },
  { value: 'priority-asc', label: `${t('tasks.sort_priority')} (↑)` },
  { value: 'title-asc', label: `${t('tasks.sort_title')} (A-Z)` },
  { value: 'title-desc', label: `${t('tasks.sort_title')} (Z-A)` },
];
