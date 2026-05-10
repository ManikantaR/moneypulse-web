import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Firebase modules (not used by useSyncStats, but required by auth provider)
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
  setDoc: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

// Mock the API fetch call used inside useSyncStats
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { useSyncStats, type SyncStats } from '@/lib/hooks/useSyncStats';

const mockStats: SyncStats = {
  pending: 5,
  retry: 2,
  delivered: 1234,
  policyFailed: 1,
  deadLetter: 0,
  lastDeliveredAt: '2026-04-26T12:00:00Z',
  recentAuditLogs: [
    {
      id: 1,
      outboxEventId: 'abc-123',
      action: 'delivery_attempt',
      policyPassed: true,
      attemptNo: 1,
      httpStatus: 200,
      errorCode: null,
      createdAt: '2026-04-26T12:00:00Z',
    },
  ],
};

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useSyncStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useSyncStats(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns stats data after successful fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });

    const { result } = renderHook(() => useSyncStats(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toMatchObject({
      pending: 5,
      retry: 2,
      delivered: 1234,
      policyFailed: 1,
      deadLetter: 0,
    });
    expect(result.current.error).toBeNull();
  });

  it('returns error when fetch fails', async () => {
    // Mock both the initial call and the retry (retry: 1 in the hook)
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Internal Server Error' }),
    });

    const { result } = renderHook(() => useSyncStats(), { wrapper });
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), {
      timeout: 5000,
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('exposes recentAuditLogs from the response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });

    const { result } = renderHook(() => useSyncStats(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.recentAuditLogs).toHaveLength(1);
    expect(result.current.data?.recentAuditLogs[0].httpStatus).toBe(200);
  });

  it('calls the correct endpoint URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });

    renderHook(() => useSyncStats(), { wrapper });
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('/sync/stats');
  });
});
