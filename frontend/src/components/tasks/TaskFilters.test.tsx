import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskFilters from './TaskFilters';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/ui/SearchInput', () => ({
  default: ({ value, onChange, placeholder }: any) => (
    <input 
      data-testid="search-input" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@/components/ui/Select', () => ({
  Select: ({ value, onChange, options }: any) => (
    <select data-testid="select" value={value} onChange={onChange}>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  ),
}));

vi.mock('@/components/ui/Tooltip', () => ({
  TooltipSimple: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/Button', () => ({
  IconButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

describe('TaskFilters', () => {
  const mockOnSearchChange = vi.fn();
  const mockSetFilters = vi.fn();
  const mockOnNewTask = vi.fn();
  const defaultFilters = { status: undefined, priority: undefined, sort_by: 'due_date', sort_dir: 'asc' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onSearchChange when search input changes', () => {
    render(
      <TaskFilters 
        searchTerm="" 
        onSearchChange={mockOnSearchChange} 
        filters={defaultFilters} 
        setFilters={mockSetFilters} 
        viewMode="gallery" 
        setViewMode={vi.fn()} 
        onNewTask={mockOnNewTask} 
      />
    );
    
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test' } });
    expect(mockOnSearchChange).toHaveBeenCalledWith('test');
  });

  it('calls setFilters when status select changes', () => {
    render(
      <TaskFilters 
        searchTerm="" 
        onSearchChange={mockOnSearchChange} 
        filters={defaultFilters} 
        setFilters={mockSetFilters} 
        viewMode="gallery" 
        setViewMode={vi.fn()} 
        onNewTask={mockOnNewTask} 
      />
    );
    
    const selects = screen.getAllByTestId('select');
    fireEvent.change(selects[0], { target: { value: 'completed' } });
    expect(mockSetFilters).toHaveBeenCalledWith({ status: 'completed' });
  });

  it('calls onNewTask when button is clicked', () => {
    render(
      <TaskFilters 
        searchTerm="" 
        onSearchChange={mockOnSearchChange} 
        filters={defaultFilters} 
        setFilters={mockSetFilters} 
        viewMode="gallery" 
        setViewMode={vi.fn()} 
        onNewTask={mockOnNewTask} 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnNewTask).toHaveBeenCalled();
  });
});
