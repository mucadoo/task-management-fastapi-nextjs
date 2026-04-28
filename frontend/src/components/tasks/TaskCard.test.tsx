import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskCard from './TaskCard';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockMutate = vi.fn();
vi.mock('@/hooks/useTasks', () => ({
  useUpdateTaskStatus: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key.split('.').pop(),
    i18n: { language: 'en' },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));
const mockTask = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending' as const,
  priority: 'medium' as const,
  created_at: '2023-10-27T10:00:00Z',
  owner_id: 1,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{ui}</TooltipProvider>
    </QueryClientProvider>,
  );
};
describe('TaskCard', () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  it('renders task details correctly', () => {
    renderWithProviders(
      <TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} isDeleting={false} />,
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
  });
  it('calls onEdit when Edit button is clicked', () => {
    renderWithProviders(
      <TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} isDeleting={false} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });
  it('calls onDelete when Delete button is clicked', () => {
    renderWithProviders(
      <TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} isDeleting={false} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(mockTask.id);
  });
  it('calls toggleStatus when Status cycle button is clicked', () => {
    renderWithProviders(
      <TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} isDeleting={false} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /mark_completed/i }));
    expect(mockMutate).toHaveBeenCalledWith({ id: mockTask.id, status: 'completed' });
  });

  it('renders correctly without description', () => {
    const taskWithoutDesc = { ...mockTask, description: '' };
    renderWithProviders(
      <TaskCard task={taskWithoutDesc} onEdit={onEdit} onDelete={onDelete} isDeleting={false} />,
    );
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });
  it('renders with different priorities', () => {
    const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    priorities.forEach((priority) => {
      const taskWithPriority = { ...mockTask, priority };
      const { unmount } = renderWithProviders(
        <TaskCard task={taskWithPriority} onEdit={onEdit} onDelete={onDelete} isDeleting={false} />,
      );
      expect(screen.getByText(new RegExp(priority, 'i'))).toBeInTheDocument();
      unmount();
    });
  });
  it('renders correctly when task is completed', () => {
    const completedTask = { ...mockTask, status: 'completed' as const };
    renderWithProviders(
      <TaskCard task={completedTask} onEdit={onEdit} onDelete={onDelete} isDeleting={false} />,
    );
    expect(screen.getByText('Test Task')).toHaveClass('line-through');
  });
});
