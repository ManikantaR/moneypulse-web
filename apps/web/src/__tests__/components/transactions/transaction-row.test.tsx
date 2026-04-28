import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionRow } from '@/components/transactions/transaction-row';
import type { TransactionDoc, CategoryDoc } from '@/lib/types/firestore';

vi.mock('@/lib/firebase', () => ({
  firebaseDb: vi.fn(() => ({})),
  firebaseAuth: vi.fn(() => ({})),
}));

const baseTransaction: TransactionDoc = {
  id: 'txn-1',
  transactionAliasId: 'alias-txn-1',
  accountAliasId: 'alias-acct-1',
  amountCents: 4500,
  date: '2026-04-15',
  categoryId: 'groceries',
  isCredit: false,
  isManual: false,
  userAliasId: 'user-alias-1',
};

describe('TransactionRow', () => {
  it('renders the formatted date', () => {
    render(<TransactionRow transaction={baseTransaction} />);
    expect(screen.getByText('Apr 15, 2026')).toBeInTheDocument();
  });

  it('renders the formatted amount', () => {
    render(<TransactionRow transaction={baseTransaction} />);
    expect(screen.getByTestId('amount')).toHaveTextContent('$45.00');
  });

  it('shows green color for credit transaction', () => {
    const creditTxn: TransactionDoc = { ...baseTransaction, isCredit: true };
    render(<TransactionRow transaction={creditTxn} />);
    const amountEl = screen.getByTestId('amount');
    expect(amountEl.className).toMatch(/green/);
    expect(amountEl).toHaveTextContent('+');
  });

  it('shows destructive color for debit transaction', () => {
    render(<TransactionRow transaction={baseTransaction} />);
    const amountEl = screen.getByTestId('amount');
    expect(amountEl.className).toMatch(/destructive/);
    expect(amountEl).toHaveTextContent('-');
  });

  it('renders category badge when categoryId is present', () => {
    const categoryMap = new Map<string, CategoryDoc>([
      ['groceries', { id: 'doc-1', categoryId: 'groceries', name: 'Groceries', icon: '🛒', color: '#00ff00', parentCategoryId: null, userAliasId: 'user-alias-1' }],
    ]);
    render(<TransactionRow transaction={baseTransaction} categoryMap={categoryMap} />);
    expect(screen.getByText('🛒 Groceries')).toBeInTheDocument();
  });

  it('shows Categorized fallback when categoryMap not provided', () => {
    render(<TransactionRow transaction={baseTransaction} />);
    expect(screen.getByText('Categorized')).toBeInTheDocument();
  });

  it('renders manual badge when isManual is true', () => {
    const manualTxn: TransactionDoc = { ...baseTransaction, isManual: true };
    render(<TransactionRow transaction={manualTxn} />);
    expect(screen.getByText('manual')).toBeInTheDocument();
  });

  it('does not render manual badge when isManual is false', () => {
    render(<TransactionRow transaction={baseTransaction} />);
    expect(screen.queryByText('manual')).not.toBeInTheDocument();
  });

  it('does not render raw IDs or alias IDs', () => {
    render(<TransactionRow transaction={baseTransaction} />);
    expect(screen.queryByText('alias-txn-1')).not.toBeInTheDocument();
    expect(screen.queryByText('alias-acct-1')).not.toBeInTheDocument();
    expect(screen.queryByText('user-alias-1')).not.toBeInTheDocument();
  });

  it('handles null categoryId gracefully', () => {
    const noCatTxn: TransactionDoc = { ...baseTransaction, categoryId: null };
    render(<TransactionRow transaction={noCatTxn} />);
    // Should render without crashing
    expect(screen.getByTestId('amount')).toBeInTheDocument();
  });
});
