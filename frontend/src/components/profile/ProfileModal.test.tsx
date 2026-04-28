import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileModal from './ProfileModal';
import { useProfileForm } from '@/hooks/useProfileForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/useProfileForm', () => ({
  useProfileForm: vi.fn(),
}));

vi.mock('@/components/ui/Dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/Tabs', () => ({
  Tabs: ({ children, value }: any) => <div data-active-tab={value}>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value: _value, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => <div data-tab-content={value}>{children}</div>,
}));

vi.mock('@/components/ui/FormField', () => ({
  FormField: ({ children, label }: any) => (
    <div>
      {label}
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Input', () => ({
  Input: vi.fn(({ placeholder, ...props }) => <input placeholder={placeholder} {...props} />),
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, type }: any) => (
    <button type={type} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('ProfileModal', () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProfileForm).mockReturnValue({
      form: {
        register: vi.fn(),
        formState: { errors: {}, touchedFields: {} },
        getValues: vi.fn(() => ({})),
      },
      isSubmitting: false,
      usernameStatus: 'idle',
      emailStatus: 'idle',
      onSubmit: mockOnSubmit,
    } as any);
  });

  it('renders correctly when open', () => {
    render(<ProfileModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('profile.title')).toBeInTheDocument();
    expect(screen.getByText('profile.personal_info')).toBeInTheDocument();
    expect(screen.getByText('profile.security')).toBeInTheDocument();
  });

  it('calls onSubmit when personal form is submitted', () => {
    render(<ProfileModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.submit(screen.getByText('common.save_changes').closest('form')!);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('calls onClose when cancel is clicked', () => {
    render(<ProfileModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getAllByText('common.cancel')[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
