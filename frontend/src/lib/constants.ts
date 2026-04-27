export const getStatusOptions = (t: any, includeAll = false) => {
  const options = [
    { value: 'pending', label: t('tasks.pending') },
    { value: 'in_progress', label: t('tasks.in_progress') },
    { value: 'completed', label: t('tasks.completed') },
  ];
  if (includeAll) {
    return [{ value: 'all', label: t('tasks.status_all') }, ...options];
  }
  return options;
};

export const getPriorityOptions = (t: any, includeAll = false) => {
  const options = [
    { value: 'low', label: t('tasks.low') },
    { value: 'medium', label: t('tasks.medium') },
    { value: 'high', label: t('tasks.high') },
  ];
  if (includeAll) {
    return [{ value: 'all', label: t('tasks.all_priorities') }, ...options];
  }
  return options;
};

export const getSortOptions = (t: any) => [
  { value: 'due_date-asc', label: `${t('tasks.sort_due')} (↑)` },
  { value: 'due_date-desc', label: `${t('tasks.sort_due')} (↓)` },
  { value: 'created_at-desc', label: `${t('tasks.sort_created')} (↓)` },
  { value: 'created_at-asc', label: `${t('tasks.sort_created')} (↑)` },
  { value: 'priority-desc', label: `${t('tasks.sort_priority')} (↓)` },
  { value: 'priority-asc', label: `${t('tasks.sort_priority')} (↑)` },
  { value: 'title-asc', label: `${t('tasks.sort_title')} (A-Z)` },
  { value: 'title-desc', label: `${t('tasks.sort_title')} (Z-A)` },
];
