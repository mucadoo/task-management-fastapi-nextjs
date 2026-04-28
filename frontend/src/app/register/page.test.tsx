import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './page';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth-service';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/auth-service', () => ({
  authService: {
    checkEmail: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/register',
}));

vi.mock('@/components/layout/LanguageSelector', () => ({
  default: () => <div data-testid="language-selector" />,
}));

vi.mock('@/components/layout/ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle" />,
}));

vi.mock('@/components/layout/AuthSidebar', () => ({
  default: () => <div data-testid="auth-sidebar" />,
}));

describe('RegisterPage', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      register: mockRegister,
    });
    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isActionLoading: false,
      isAuthenticated: false,
    } as any);
    vi.mocked(authService.checkEmail).mockResolvedValue({ available: true });
  });

  it('renders register form', () => {
    render(<RegisterPage />);
    expect(screen.getByText('auth.register_header')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('auth.name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('auth.email')).toBeInTheDocument();
  });

  it('calls register on submit with valid data', async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText('auth.name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('auth.username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('auth.email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('auth.password'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('auth.confirm_password'), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /auth.register/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      });
    });
  });

  it('checks email availability', async () => {
    render(<RegisterPage />);

    const emailInput = screen.getByPlaceholderText('auth.email');
    fireEvent.change(emailInput, { target: { value: 'taken@example.com' } });

    await waitFor(() => {
      expect(authService.checkEmail).toHaveBeenCalledWith('taken@example.com');
    });
  });
});
