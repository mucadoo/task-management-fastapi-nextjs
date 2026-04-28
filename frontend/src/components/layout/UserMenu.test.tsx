import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UserMenu from './UserMenu';
import { useAuthStore } from '@/store/useAuthStore';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/components/ui/Avatar', () => ({
  Avatar: () => <div data-testid="avatar" />,
}));

vi.mock('@/components/ui/DropdownMenu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid="menu-item" onClick={onClick}>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

describe('UserMenu', () => {
  const mockLogout = vi.fn();
  const mockOnProfileOpen = vi.fn();
  const mockUser = { name: 'Test User', username: 'testuser', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    } as any);
  });

  it('renders user information', () => {
    render(<UserMenu onProfileOpen={mockOnProfileOpen} />);

    expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
    expect(screen.getAllByText('@testuser').length).toBeGreaterThan(0);
  });

  it('calls logout when logout item is clicked', () => {
    render(<UserMenu onProfileOpen={mockOnProfileOpen} />);
    const logoutItem = screen.getByText('common.logout');
    fireEvent.click(logoutItem);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('calls onProfileOpen when profile item is clicked', () => {
    render(<UserMenu onProfileOpen={mockOnProfileOpen} />);
    const profileItem = screen.getByText('common.profile');
    fireEvent.click(profileItem);
    expect(mockOnProfileOpen).toHaveBeenCalledWith('personal');
  });
});