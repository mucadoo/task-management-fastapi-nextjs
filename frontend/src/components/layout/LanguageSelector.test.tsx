import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from './LanguageSelector';

const mockChangeLanguage = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

vi.mock('@/components/ui/DropdownMenu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
    <div onClick={onClick}>{children}</div>
  ),
}));
describe('LanguageSelector', () => {
  it('renders correctly', () => {
    render(<LanguageSelector />);
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('opens dropdown and changes language', () => {
    render(<LanguageSelector />);

    const trigger = screen.getByLabelText('common.select_language');
    fireEvent.click(trigger);

    const portugueseOption = screen.getByText('common.portuguese');
    fireEvent.click(portugueseOption);

    expect(mockChangeLanguage).toHaveBeenCalledWith('pt');
  });
});