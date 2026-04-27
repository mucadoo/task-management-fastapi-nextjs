import { describe, it, expect, vi } from 'vitest';
import StatusBadge from './StatusBadge';
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key.split('.').pop(),
  }),
}));
describe('StatusBadge', () => {
  it('renders correctly for pending status', () => {
    const { container } = render(<StatusBadge status="pending" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/blue/);
  });
  it('renders correctly for in_progress status', () => {
    const { container } = render(<StatusBadge status="in_progress" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/amber/);
  });
  it('renders correctly for completed status', () => {
    const { container } = render(<StatusBadge status="completed" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/emerald/);
  });
});
