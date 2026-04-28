import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppLayout } from './AppLayout';

vi.mock('./DashboardHeader', () => ({
  default: () => <div data-testid="dashboard-header" />,
}));

vi.mock('@/components/profile/ProfileModal', () => ({
  default: () => <div data-testid="profile-modal" />,
}));

describe('AppLayout', () => {
  it('renders children and layout components', () => {
    render(
      <AppLayout
        totalTasks={0}
        onProfileOpen={vi.fn()}
        isProfileOpen={false}
        onProfileClose={vi.fn()}
        profileTab="personal"
      >
        <div data-testid="child">Child Content</div>
      </AppLayout>,
    );

    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByTestId('profile-modal')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
