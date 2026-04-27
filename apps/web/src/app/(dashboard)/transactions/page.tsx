'use client';

import { useState } from 'react';
import { FilterBar } from '@/components/transactions/filter-bar';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { EmptyState } from '@/components/dashboard/empty-state';
import { useTransactionsResult, type TransactionFilters } from '@/lib/queries/use-transactions';
import type { Metadata } from 'next';

const PAGE_SIZE = 50;

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [activePreset, setActivePreset] = useState<'all' | 'income' | 'expenses' | 'this-month' | 'last-month'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isEmpty } = useTransactionsResult(filters);
  const visibleTransactions = data.slice(0, page * PAGE_SIZE);
  const hasMore = visibleTransactions.length < data.length;

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      <h1 className="mb-4 text-2xl font-semibold">Transactions</h1>

      <div className="mb-4">
        <FilterBar
          activePreset={activePreset}
          onFilterChange={(f, preset) => {
            setFilters(f);
            setActivePreset(preset);
            setPage(1);
          }}
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Failed to load transactions. Please try again.
        </div>
      )}

      {!isLoading && !isError && isEmpty && <EmptyState />}

      {!isLoading && !isError && !isEmpty && (
        <>
          <div className="rounded-xl border bg-card p-4">
            {visibleTransactions.map((txn) => (
              <TransactionRow key={txn.id} transaction={txn} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-border px-6 py-2 text-sm hover:bg-muted"
              >
                Load more
              </button>
            </div>
          )}

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Showing {visibleTransactions.length} of {data.length} transactions
          </p>
        </>
      )}
    </main>
  );
}
