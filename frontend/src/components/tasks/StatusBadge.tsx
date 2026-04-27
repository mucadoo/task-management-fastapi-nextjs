'use client';
import { TaskStatus } from '@/types/task';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';

interface StatusBadgeProps {
  status: TaskStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  const variants: Record<TaskStatus, 'blue' | 'amber' | 'emerald'> = {
    pending: 'blue',
    in_progress: 'amber',
    completed: 'emerald',
  };

  return (
    <Badge variant={variants[status]} showDot>
      {t(`tasks.${status}`)}
    </Badge>
  );
}
