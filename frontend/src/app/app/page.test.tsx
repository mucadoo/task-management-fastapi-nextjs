import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppDashboardPage from './page';
import { useAuth } from '@/hooks/useAuth';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/components/tasks/TaskBoard', () => ({
  default: () => <div data-testid="task-board" />,
}));

describe('AppDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
    } as any);

    render(<AppDashboardPage />);
    expect(screen.getByText('common.authenticating')).toBeInTheDocument();
  });

  it('renders TaskBoard when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    } as any);

    render(<AppDashboardPage />);
    expect(screen.getByTestId('task-board')).toBeInTheDocument();
  });

  it('renders loading spinner when not authenticated and not loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    } as any);

    render(<AppDashboardPage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
