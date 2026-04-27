import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/firebase', () => ({
  firebaseAuth: vi.fn(() => ({})),
  firebaseDb: vi.fn(() => ({})),
  firebaseMessaging: vi.fn(() => null),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => () => {}),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => undefined })),
}));

const mockUseSyncFreshness = vi.fn();
vi.mock('@/lib/queries/use-sync-freshness', () => ({
  useSyncFreshness: () => mockUseSyncFreshness(),
}));

import { FreshnessBanner } from '@/components/dashboard/freshness-banner';

describe('FreshnessBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows never-synced message when lastSyncAt is null', () => {
    mockUseSyncFreshness.mockReturnValue({ lastSyncAt: null, isStale: true });
    render(<FreshnessBanner />);
    expect(screen.getByRole('status')).toHaveTextContent(/never synced/i);
  });

  it('shows yellow/warning style when stale', () => {
    mockUseSyncFreshness.mockReturnValue({ lastSyncAt: null, isStale: true });
    render(<FreshnessBanner />);
    expect(screen.getByRole('status').className).toMatch(/yellow/);
  });

  it('shows green style when fresh', () => {
    mockUseSyncFreshness.mockReturnValue({
      lastSyncAt: new Date(),
      isStale: false,
    });
    render(<FreshnessBanner />);
    expect(screen.getByRole('status').className).toMatch(/green/);
  });

  it('shows relative time when lastSyncAt is set', () => {
    mockUseSyncFreshness.mockReturnValue({
      lastSyncAt: new Date(Date.now() - 5 * 60 * 1000),
      isStale: false,
    });
    render(<FreshnessBanner />);
    expect(screen.getByRole('status')).toHaveTextContent(/ago/i);
  });
});
