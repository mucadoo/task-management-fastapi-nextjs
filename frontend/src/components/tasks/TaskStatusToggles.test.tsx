import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskStatusToggles } from './TaskStatusToggles';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('TaskStatusToggles', () => {
  const defaultProps = {
    status: 'pending' as const,
    onToggleCompletion: vi.fn(),
    onToggleInProgress: vi.fn(),
    isToggling: false,
    isDeleting: false,
  };

  it('renders correctly in pending status', () => {
    render(<TaskStatusToggles {...defaultProps} />);
    expect(screen.getByLabelText('tasks.mark_completed')).toBeInTheDocument();
    expect(screen.getByLabelText('tasks.mark_in_progress')).toBeInTheDocument();
  });

  it('renders correctly in in_progress status', () => {
    render(<TaskStatusToggles {...defaultProps} status="in_progress" />);
    expect(screen.getByLabelText('tasks.mark_completed')).toBeInTheDocument();
    expect(screen.getByLabelText('tasks.mark_pending')).toBeInTheDocument();
  });

  it('renders correctly in completed status', () => {
    render(<TaskStatusToggles {...defaultProps} status="completed" />);
    expect(screen.getByLabelText('tasks.mark_pending')).toBeInTheDocument();
    expect(screen.queryByLabelText('tasks.mark_in_progress')).not.toBeInTheDocument();
  });

  it('calls onToggleCompletion when clicked', () => {
    render(<TaskStatusToggles {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('tasks.mark_completed'));
    expect(defaultProps.onToggleCompletion).toHaveBeenCalled();
  });

  it('calls onToggleInProgress when clicked', () => {
    render(<TaskStatusToggles {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('tasks.mark_in_progress'));
    expect(defaultProps.onToggleInProgress).toHaveBeenCalled();
  });

  it('disables buttons when isToggling is true', () => {
    render(<TaskStatusToggles {...defaultProps} isToggling={true} />);
    expect(screen.getByLabelText('tasks.mark_completed')).toBeDisabled();
    expect(screen.getByLabelText('tasks.mark_in_progress')).toBeDisabled();
  });

  it('shows loading spinner when isToggling is true', () => {
    render(<TaskStatusToggles {...defaultProps} status="completed" isToggling={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
