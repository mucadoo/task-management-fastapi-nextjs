'use client';
import { TaskStatus } from '../types/task';
import { useTranslation } from 'react-i18next';
import { Badge } from './ui/Badge';

interface StatusBadgeProps {
  status: TaskStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  
  const labels = {
    pending: t('tasks.pending'),
    in_progress: t('tasks.in_progress'),
    completed: t('tasks.completed'),
  };

  const dots = {
    pending: 'bg-blue-500',
    in_progress: 'bg-amber-500',
    completed: 'bg-emerald-500',
  };

  return (
    <Badge variant={status} className="gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {labels[status]}
    </Badge>
  );
}
