import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/firebase', () => ({
  firebaseAuth: vi.fn(() => ({})),
  firebaseDb: vi.fn(() => ({})),
  firebaseMessaging: vi.fn(() => null),
}));

vi.mock('@/lib/auth/use-auth', () => ({
  useAuth: vi.fn(() => ({ user: { uid: 'uid-1' }, loading: false, profile: null, signOut: vi.fn() })),
}));

const mockGetDocs = vi.fn();
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
}));

import { useTransactionsResult } from '@/lib/queries/use-transactions';

const txnData = {
  transactionAliasId: 'alias-1',
  accountAliasId: 'acct-1',
  userAliasId: 'uid-1',
  amountCents: 5000,
  date: '2026-04-10',
  categoryId: 'food',
  isCredit: false,
  isManual: false,
};

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useTransactionsResult', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns isLoading true initially', () => {
    mockGetDocs.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useTransactionsResult(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('returns transaction documents on success', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [{ id: 'txn-1', data: () => txnData }],
    });
    const { result } = renderHook(() => useTransactionsResult(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe('txn-1');
    expect(result.current.data[0].amountCents).toBe(5000);
  });

  it('marks isEmpty when no results', async () => {
    mockGetDocs.mockResolvedValueOnce({ docs: [] });
    const { result } = renderHook(() => useTransactionsResult(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isEmpty).toBe(true);
  });

  it('marks isError on Firestore failure', async () => {
    mockGetDocs.mockRejectedValueOnce(new Error('permission-denied'));
    const { result } = renderHook(() => useTransactionsResult(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
