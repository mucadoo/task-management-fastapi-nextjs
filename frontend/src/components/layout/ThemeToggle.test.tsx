import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from 'next-themes';

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/Button', () => ({
  IconButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

describe('ThemeToggle', () => {
  it('calls setTheme when clicked', () => {
    const setTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      resolvedTheme: 'light',
      setTheme,
    } as any);

    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button'));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('toggles to light when current theme is dark', () => {
    const setTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      resolvedTheme: 'dark',
      setTheme,
    } as any);

    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button'));
    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
