import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskDateBadge } from './TaskDateBadge';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

describe('TaskDateBadge', () => {
  it('renders null if no dueDate', () => {
    const { container } = render(
      <TaskDateBadge
        dueDate={null}
        hasTime={false}
        isOverdue={false}
        isDueToday={false}
        isCompleted={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly in list variant', () => {
    render(
      <TaskDateBadge
        dueDate="2023-01-01T12:00:00Z"
        hasTime={false}
        isOverdue={false}
        isDueToday={false}
        isCompleted={false}
        variant="list"
      />,
    );
    expect(screen.getByText(/Jan 1|Dec 31/)).toBeInTheDocument();
  });

  it('renders correctly in gallery variant', () => {
    render(
      <TaskDateBadge
        dueDate="2023-01-01T12:00:00Z"
        hasTime={false}
        isOverdue={false}
        isDueToday={false}
        isCompleted={false}
        variant="gallery"
      />,
    );
    expect(screen.getByText(/Jan 1|Dec 31/)).toBeInTheDocument();
    expect(screen.getByText('tasks.due_date')).toBeInTheDocument();
  });

  it('handles overdue state', () => {
    render(
      <TaskDateBadge
        dueDate="2023-01-01T12:00:00Z"
        hasTime={false}
        isOverdue={true}
        isDueToday={false}
        isCompleted={false}
        variant="gallery"
      />,
    );
    expect(screen.getByText('tasks.overdue')).toBeInTheDocument();
  });

  it('handles due today state', () => {
    render(
      <TaskDateBadge
        dueDate="2023-01-01T12:00:00Z"
        hasTime={false}
        isOverdue={false}
        isDueToday={true}
        isCompleted={false}
        variant="list"
      />,
    );
    expect(screen.getByText('tasks.today')).toBeInTheDocument();
  });

  it('handles completed state (should not show overdue/today labels)', () => {
    render(
      <TaskDateBadge
        dueDate="2023-01-01T12:00:00Z"
        hasTime={false}
        isOverdue={true}
        isDueToday={true}
        isCompleted={true}
        variant="list"
      />,
    );
    expect(screen.queryByText('tasks.today')).not.toBeInTheDocument();
  });

  it('handles time display', () => {
    render(
      <TaskDateBadge
        dueDate="2023-01-01T12:00:00"
        hasTime={true}
        isOverdue={false}
        isDueToday={false}
        isCompleted={false}
      />,
    );
    expect(screen.getByText(/Jan 1|Dec 31/)).toBeInTheDocument();
  });
});
