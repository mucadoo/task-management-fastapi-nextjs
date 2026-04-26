'use client';
import { TaskPriority } from '../types/task';
import { useTranslation } from 'react-i18next';
import { Badge } from './ui/Badge';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { t } = useTranslation();
  
  const labels = {
    low: t('tasks.low'),
    medium: t('tasks.medium'),
    high: t('tasks.high'),
  };

  return (
    <Badge variant={priority}>
      {labels[priority]}
    </Badge>
  );
}
