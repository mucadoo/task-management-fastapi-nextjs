import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { IconButton } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';

interface TaskCardActionsProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  className?: string;
}

export function TaskCardActions({
  task,
  onEdit,
  onDelete,
  isDeleting,
  className,
}: TaskCardActionsProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            disabled={isDeleting}
            aria-label={t('common.edit')}
            className="text-warm-400 dark:text-gray-500 hover:text-brand-500"
          >
            <Pencil className="h-3.5 w-3.5" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="top">{t('common.edit')}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            isLoading={isDeleting}
            aria-label={t('common.delete')}
            className="text-warm-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="top">{t('common.delete')}</TooltipContent>
      </Tooltip>
    </div>
  );
}
