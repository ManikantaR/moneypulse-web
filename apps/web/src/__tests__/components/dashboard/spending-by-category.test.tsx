import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpendingByCategory } from '@/components/dashboard/spending-by-category';
import type { TransactionDoc, CategoryDoc } from '@/lib/types/firestore';

vi.mock('@/lib/firebase', () => ({
  firebaseDb: vi.fn(() => ({})),
  firebaseAuth: vi.fn(() => ({})),
}));

vi.mock('@/components/privacy/blurred-amount', () => ({
  BlurredAmount: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

function makeTxn(overrides: Partial<TransactionDoc>): TransactionDoc {
  return {
    id: String(Math.random()),
    transactionAliasId: 'a',
    accountAliasId: 'b',
    userAliasId: 'uid',
    amountCents: 1000,
    date: '2026-05-01',
    categoryId: 'cat-1',
    merchantName: null,
    isCredit: false,
    isManual: false,
    ...overrides,
  };
}

const cat: CategoryDoc = {
  id: 'cat-1',
  categoryId: 'cat-1',
  name: 'Groceries',
  icon: null,
  color: null,
  parentCategoryId: null,
  userAliasId: 'uid',
};
const categoryMap = new Map([['cat-1', cat]]);

describe('SpendingByCategory', () => {
  it('renders expense categories', () => {
    const txns = [makeTxn({ amountCents: 5000 })];
    render(<SpendingByCategory transactions={txns} categoryMap={categoryMap} />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('excludes transfer transactions from spending totals', () => {
    const txns = [
      makeTxn({ amountCents: 4000, isTransfer: false }),
      makeTxn({ amountCents: 9000, isTransfer: true }),   // transfer — must not count
    ];
    render(<SpendingByCategory transactions={txns} categoryMap={categoryMap} />);
    // Only $40 should appear, not $130
    expect(screen.getByText('$40')).toBeInTheDocument();
    expect(screen.queryByText('$130')).not.toBeInTheDocument();
  });

  it('returns null when all remaining expenses are transfers', () => {
    const txns = [makeTxn({ amountCents: 5000, isTransfer: true })];
    const { container } = render(<SpendingByCategory transactions={txns} categoryMap={categoryMap} />);
    expect(container.firstChild).toBeNull();
  });
});
