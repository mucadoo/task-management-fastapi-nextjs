import { describe, it, expect, vi } from 'vitest';
import { redirect } from 'next/navigation';
import RootPage from './page';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('RootPage', () => {
  it('redirects to /app', () => {
    RootPage();
    expect(redirect).toHaveBeenCalledWith('/app');
  });
});
