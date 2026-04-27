export function getTaskDateStatus(
  dueDateStr: string | null | undefined,
  isCompleted: boolean,
  hasTime: boolean,
) {
  if (!dueDateStr || isCompleted) {
    return { isOverdue: false, isDueToday: false };
  }

  const dueDate = new Date(dueDateStr);
  const now = new Date();

  if (hasTime) {
    return {
      isOverdue: dueDate < now,
      isDueToday: dueDate.toDateString() === now.toDateString() && dueDate >= now,
    };
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDay = new Date(dueDateStr);
    dueDay.setHours(0, 0, 0, 0);

    return {
      isOverdue: dueDay < today,
      isDueToday: dueDay.getTime() === today.getTime(),
    };
  }
}
