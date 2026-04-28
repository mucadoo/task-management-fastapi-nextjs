import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuth } from '@/hooks/useAuth';

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

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/login',
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

describe('LoginPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
    } as any);
    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isActionLoading: false,
      isAuthenticated: false,
    } as any);
  });

  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('auth.sign_in_header')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('auth.email_or_username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('auth.password')).toBeInTheDocument();
  });

  it('calls login on submit with valid data', async () => {
    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('auth.email_or_username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('auth.password'), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /auth.login/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        identifier: 'testuser',
        password: 'password123',
      });
    });
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginPage />);
    
    fireEvent.click(screen.getByRole('button', { name: /auth.login/i }));
    
    // Zod validation messages are translated via t('common.error_required') in validations.ts
    // In our mock t returns the key
    await waitFor(() => {
      expect(screen.getAllByText('common.error_required')).toHaveLength(2);
    });
  });
});
