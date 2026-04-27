'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Plus, LayoutGrid, List } from 'lucide-react';
import SearchInput from './ui/SearchInput';
import { TooltipSimple } from './ui/Tooltip';
import { cn } from '../lib/utils';
import { TaskStatus, TaskPriority } from '../types/task';
import { Select } from './ui/Select';
import { getStatusOptions, getPriorityOptions, getSortOptions } from '../lib/constants';

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  filters: any;
  setFilters: (filters: any) => void;
  viewMode: 'gallery' | 'list';
  setViewMode: (mode: 'gallery' | 'list') => void;
  onNewTask: () => void;
}

export default function TaskFilters({
  searchTerm,
  onSearchChange,
  filters,
  setFilters,
  viewMode,
  setViewMode,
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
        <SearchInput
          placeholder={t('tasks.search')}
          value={searchTerm}
          onChange={onSearchChange}
        />
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
        <button
          onClick={onNewTask}
          className="h-10 w-10 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center justify-center shadow-sm shadow-brand-500/10 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </TooltipSimple>
    </div>
  );
}
