import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskForm from './TaskForm';
import { useTaskForm } from '@/hooks/useTaskForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/useTaskForm', () => ({
  useTaskForm: vi.fn(),
}));

vi.mock('@/components/ui/Dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, type }: any) => (
    <button type={type} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/Input', () => ({
  Input: vi.fn(() => <input />),
}));

vi.mock('@/components/ui/Textarea', () => ({
  Textarea: vi.fn(() => <textarea />),
}));

vi.mock('@/components/ui/Select', () => ({
  Select: vi.fn(() => <select />),
}));

vi.mock('@/components/ui/FormField', () => ({
  FormField: ({ children, label }: any) => (
    <div>
      {label}
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/FormControl', () => ({
  FormControl: ({ children, label }: any) => (
    <div>
      {label}
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/DateTimePicker', () => ({
  DateTimePicker: () => <div data-testid="date-time-picker" />,
}));

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    Controller: ({ render, field: _field }: any) =>
      render({ field: { value: new Date(), onChange: vi.fn() } }),
  };
});

describe('TaskForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTaskForm).mockReturnValue({
      form: {
        register: vi.fn(),
        control: {},
        watch: vi.fn(),
        setValue: vi.fn(),
        formState: { errors: {} },
      },
      isSubmitting: false,
      onSubmit: mockOnSubmit,
    } as any);
  });

  it('renders "New Task" title when not editing', () => {
    render(<TaskForm isOpen={true} onClose={mockOnClose} editingTask={null} />);
    expect(screen.getByText('tasks.new_task')).toBeInTheDocument();
  });

  it('renders "Edit Task" title when editing', () => {
    const task = { id: '1', title: 'Task 1' } as any;
    render(<TaskForm isOpen={true} onClose={mockOnClose} editingTask={task} />);
    expect(screen.getAllByText('tasks.edit_task').length).toBeGreaterThan(0);
  });

  it('calls onSubmit when form is submitted', () => {
    render(<TaskForm isOpen={true} onClose={mockOnClose} editingTask={null} />);
    fireEvent.submit(screen.getByRole('button', { name: /tasks.create_task/i }).closest('form')!);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('calls onClose when cancel is clicked', () => {
    render(<TaskForm isOpen={true} onClose={mockOnClose} editingTask={null} />);
    fireEvent.click(screen.getByText('common.cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
