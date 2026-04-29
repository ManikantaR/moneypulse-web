import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/lib/firebase', () => ({
  firebaseAuth: vi.fn(() => ({})),
  firebaseDb: vi.fn(() => ({})),
  firebaseMessaging: vi.fn(() => null),
}));

vi.mock('@/lib/auth/use-auth', () => ({
  useAuth: vi.fn(() => ({ user: { uid: 'uid-1' }, loading: false })),
}));

type SnapshotCallback = (snap: { docs: Array<{ id: string; data: () => Record<string, unknown> }> }) => void;
let capturedCallback: SnapshotCallback | null = null;
const mockUnsub = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  onSnapshot: vi.fn((_q: unknown, cb: SnapshotCallback) => {
    capturedCallback = cb;
    return mockUnsub;
  }),
  doc: vi.fn(() => ({})),
  updateDoc: vi.fn(),
  writeBatch: vi.fn(),
}));

import { useNotifications } from '@/lib/fcm/use-notifications';

const makeDoc = (id: string, isRead: boolean) => ({
  id,
  data: () => ({
    type: 'budget_alert',
    title: 'Over budget: Dining',
    body: 'Over budget: Dining',
    isRead,
    userAliasId: 'uid-1',
    createdAt: null,
  }),
});

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallback = null;
  });

  it('starts loading', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.notifications).toEqual([]);
  });

  it('populates notifications from snapshot', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      capturedCallback?.({ docs: [makeDoc('n1', false), makeDoc('n2', true)] });
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.notifications).toHaveLength(2);
  });

  it('counts unread correctly', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      capturedCallback?.({ docs: [makeDoc('n1', false), makeDoc('n2', false), makeDoc('n3', true)] });
    });
    expect(result.current.unreadCount).toBe(2);
  });

  it('returns unreadCount 0 when all read', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      capturedCallback?.({ docs: [makeDoc('n1', true)] });
    });
    expect(result.current.unreadCount).toBe(0);
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useNotifications());
    unmount();
    expect(mockUnsub).toHaveBeenCalled();
  });
});
