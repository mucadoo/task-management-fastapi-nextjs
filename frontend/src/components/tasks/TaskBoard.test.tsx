import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskBoard from './TaskBoard';
import { useTaskBoard } from '@/hooks/useTaskBoard';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/useTaskBoard', () => ({
  useTaskBoard: vi.fn(),
}));

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: any) => <div data-testid="app-layout">{children}</div>,
}));

vi.mock('./TaskCard', () => ({
  default: () => <div data-testid="task-card" />,
}));

vi.mock('./TaskForm', () => ({
  default: () => <div data-testid="task-form" />,
}));

vi.mock('./TaskFilters', () => ({
  default: () => <div data-testid="task-filters" />,
}));

vi.mock('@/components/ui/ConfirmDialog', () => ({
  default: () => <div data-testid="confirm-dialog" />,
}));

vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: () => <div data-testid="empty-state" />,
}));

vi.mock('./InfiniteScrollTrigger', () => ({
  InfiniteScrollTrigger: () => <div data-testid="infinite-scroll" />,
}));

describe('TaskBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeletons when loading and no tasks', () => {
    vi.mocked(useTaskBoard).mockReturnValue({
      isLoading: true,
      tasks: [],
      total: 0,
      viewMode: 'gallery',
      filters: {},
      searchTerm: '',
    } as any);

    render(<TaskBoard />);
    expect(screen.getByText('tasks.title')).toBeInTheDocument();
  });

  it('renders tasks when available', () => {
    vi.mocked(useTaskBoard).mockReturnValue({
      isLoading: false,
      tasks: [{ id: '1', title: 'Task 1' }],
      total: 1,
      viewMode: 'gallery',
      filters: {},
      searchTerm: '',
    } as any);

    render(<TaskBoard />);
    expect(screen.getByTestId('task-card')).toBeInTheDocument();
  });

  it('renders empty state when no tasks', () => {
    vi.mocked(useTaskBoard).mockReturnValue({
      isLoading: false,
      tasks: [],
      total: 0,
      viewMode: 'gallery',
      filters: {},
      searchTerm: '',
    } as any);

    render(<TaskBoard />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});
