import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from '@/components/dashboard/empty-state';

vi.mock('@/lib/firebase', () => ({
  firebaseDb: vi.fn(() => ({})),
  firebaseAuth: vi.fn(() => ({})),
}));

describe('EmptyState', () => {
  it('renders the no data message', () => {
    render(<EmptyState />);
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('renders the sync instruction', () => {
    render(<EmptyState />);
    expect(
      screen.getByText('Run a sync from your local MoneyPulse app.'),
    ).toBeInTheDocument();
  });
});
