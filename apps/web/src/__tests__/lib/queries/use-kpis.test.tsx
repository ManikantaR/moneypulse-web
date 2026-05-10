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
  useAuth: vi.fn(() => ({ user: { uid: 'test-uid' }, loading: false, profile: null, signOut: vi.fn() })),
}));

const mockGetDocs = vi.fn();
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
}));

import { useKpis } from '@/lib/queries/use-kpis';

function makeDoc(amountCents: number, isCredit: boolean) {
  return {
    id: String(Math.random()),
    data: () => ({
      transactionAliasId: 'a',
      accountAliasId: 'b',
      userAliasId: 'test-uid',
      amountCents,
      date: '2026-04-15',
      categoryId: null,
      isCredit,
      isManual: false,
    }),
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useKpis', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns zero KPIs while loading', () => {
    mockGetDocs.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useKpis('2026-04'), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.income).toBe(0);
    expect(result.current.expenses).toBe(0);
  });

  it('computes income, expenses and cashFlow correctly', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        makeDoc(10000, true),  // $100 income
        makeDoc(4000, false),  // $40 expense
        makeDoc(6000, true),   // $60 income
      ],
    });

    const { result } = renderHook(() => useKpis('2026-04'), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.income).toBe(16000);
    expect(result.current.expenses).toBe(4000);
    expect(result.current.cashFlow).toBe(12000);
  });

  it('marks isEmpty when no transactions', async () => {
    mockGetDocs.mockResolvedValueOnce({ docs: [] });
    const { result } = renderHook(() => useKpis('2026-04'), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isEmpty).toBe(true);
  });
});
