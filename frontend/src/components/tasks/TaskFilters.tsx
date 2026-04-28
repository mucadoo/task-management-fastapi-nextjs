'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import SearchInput from '@/components/ui/SearchInput';
import { TooltipSimple } from '@/components/ui/Tooltip';
import { IconButton } from '@/components/ui/Button';
import { TaskStatus, TaskPriority } from '@/types/task';
import { Select } from '@/components/ui/Select';
import { getStatusOptions, getPriorityOptions, getSortOptions } from '@/lib/constants';
import { Plus } from 'lucide-react';

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    q?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  setFilters: (filters: Partial<TaskFiltersProps['filters']>) => void;
  viewMode: 'gallery' | 'list';
  setViewMode: (mode: 'gallery' | 'list') => void;
  onNewTask: () => void;
}

export default function TaskFilters({
  searchTerm,
  onSearchChange,
  filters,
  setFilters,
  onNewTask,
}: TaskFiltersProps) {
  const { t } = useTranslation();

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({ priority: value === 'all' ? undefined : (value as TaskPriority) });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({ status: value === 'all' ? undefined : (value as TaskStatus) });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [sortBy, sortDir] = value.split('-');
    setFilters({ sort_by: sortBy, sort_dir: sortDir });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
      <div className="flex-[2]">
        <SearchInput placeholder={t('tasks.search')} value={searchTerm} onChange={onSearchChange} />
      </div>
      <div className="flex flex-1 items-center gap-3">
        <Select
          value={filters.status || 'all'}
          onChange={handleStatusChange}
          options={getStatusOptions(t, true)}
          className="flex-1"
        />

        <Select
          value={filters.priority || 'all'}
          onChange={handlePriorityChange}
          options={getPriorityOptions(t, true)}
          className="flex-1"
        />
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        <span className="text-[10px] font-bold text-warm-500 dark:text-gray-500 uppercase tracking-widest ml-1 hidden lg:block">
          {t('tasks.sort_by')}
        </span>
        <Select
          value={`${filters.sort_by || 'due_date'}-${filters.sort_dir || 'asc'}`}
          onChange={handleSortChange}
          options={getSortOptions(t)}
          className="w-[180px]"
        />
      </div>

      <TooltipSimple content={t('tasks.new_task')} side="left">
        <IconButton
          onClick={onNewTask}
          aria-label={t('tasks.new_task')}
          className="h-10 w-10 shadow-sm shadow-brand-500/10"
        >
          <Plus className="h-5 w-5" />
        </IconButton>
      </TooltipSimple>
    </div>
  );
}