import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskCard from './TaskCard';
import { TaskStatus, TaskPriority } from '../types/task';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key.split('.').pop(),
    i18n: { language: 'en' }
  })
}));

const mockTask = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending' as const,
  priority: 'medium' as const,
  created_at: '2023-10-27T10:00:00Z',
  owner_id: 1
};

describe('TaskCard', () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const onToggle = vi.fn();

  it('renders task details correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        isDeleting={false}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        isDeleting={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when Delete button is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        isDeleting={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it('calls onToggle when Status Badge is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        isDeleting={false}
      />
    );

    fireEvent.click(screen.getByTitle('Click to toggle status'));
    expect(onToggle).toHaveBeenCalledWith(mockTask.id);
  });

  it('disables buttons when isDeleting is true', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        isDeleting={true}
      />
    );

    expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled();
    expect(screen.getByTitle('Click to toggle status')).toBeDisabled();
  });
});
