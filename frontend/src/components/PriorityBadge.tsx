'use client';
import { TaskPriority } from '../types/task';
import { useTranslation } from 'react-i18next';
import { Badge } from './ui/Badge';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { t } = useTranslation();
  
  const variants: Record<TaskPriority, 'blue' | 'amber' | 'red'> = {
    low: 'blue',
    medium: 'amber',
    high: 'red',
  };

  return (
    <Badge variant={variants[priority]}>
      {t(`tasks.${priority}`)}
    </Badge>
  );
}
