import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PriorityBadge from './PriorityBadge';
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key.split('.').pop(),
  }),
}));
describe('PriorityBadge', () => {
  it('renders high priority with correct style', () => {
    const { container } = render(<PriorityBadge priority="high" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/red/);
  });
  it('renders medium priority with correct style', () => {
    const { container } = render(<PriorityBadge priority="medium" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/amber/);
  });
  it('renders low priority with correct style', () => {
    const { container } = render(<PriorityBadge priority="low" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/emerald/);
  });
});
