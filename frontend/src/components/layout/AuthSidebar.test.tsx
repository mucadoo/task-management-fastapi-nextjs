import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthSidebar from './AuthSidebar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('AuthSidebar', () => {
  it('renders app name and slogan', () => {
    render(<AuthSidebar />);
    expect(screen.getByText('common.app_name')).toBeInTheDocument();
    expect(screen.getByText('auth.slogan')).toBeInTheDocument();
  });
});
