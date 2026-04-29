'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CategorySpendRow } from '@/components/categories/category-spend-row';
import { BlurredAmount } from '@/components/privacy/blurred-amount';
import { useTransactionsResult } from '@/lib/queries/use-transactions';
import { useCategories } from '@/lib/queries/use-categories';

function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function stepMonth(monthYear: string, delta: -1 | 1): string {
  const [y, m] = monthYear.split('-').map(Number) as [number, number];
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthYear: string): string {
  const [y, m] = monthYear.split('-').map(Number) as [number, number];
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function CategoriesPage() {
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear);

  const [y, m] = monthYear.split('-').map(Number) as [number, number];
  const lastDay = new Date(y, m, 0).getDate();
  const startDate = `${monthYear}-01`;
  const endDate = `${monthYear}-${String(lastDay).padStart(2, '0')}`;

  const { data: transactions, isLoading: txLoading } = useTransactionsResult({ startDate, endDate });
  const { data: categories, isLoading: catLoading } = useCategories();

  const isLoading = txLoading || catLoading;

  // Build categoryId → CategoryDoc map
  const catMap = new Map((categories ?? []).map((c) => [c.categoryId, c]));

  // Aggregate spend per category (expenses only)
  const totals = new Map<string | null, number>();
  for (const txn of transactions) {
    if (txn.isCredit) continue;
    const key = txn.categoryId ?? null;
    totals.set(key, (totals.get(key) ?? 0) + txn.amountCents);
  }

  const sorted = [...totals.entries()]
    .map(([key, cents]) => ({ key, cents, cat: key ? catMap.get(key) ?? null : null }))
    .sort((a, b) => b.cents - a.cents);

  const totalSpend = sorted.reduce((s, r) => s + r.cents, 0);
  const maxCents = sorted[0]?.cents ?? 1;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonthYear((m) => stepMonth(m, -1))}
            className="rounded p-1 hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[130px] text-center text-sm font-medium">
            {formatMonthLabel(monthYear)}
          </span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setMonthYear((m) => stepMonth(m, 1))}
            className="rounded p-1 hover:bg-muted"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Summary strip */}
      {!isLoading && totalSpend > 0 && (
        <div className="mb-4 rounded-xl border bg-card px-5 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total expenses</span>
          <BlurredAmount className="text-lg font-bold tabular-nums">
            {(totalSpend / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </BlurredAmount>
        </div>
      )}

      {/* Category rows */}
      <div className="rounded-xl border bg-card p-4 space-y-4">
        {isLoading && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </>
        )}

        {!isLoading && sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No expenses recorded for {formatMonthLabel(monthYear)}.
          </p>
        )}

        {!isLoading && sorted.map(({ key, cents, cat }) => (
          <CategorySpendRow
            key={key ?? '__none__'}
            category={cat ?? null}
            spentCents={cents}
            budgetCents={null}
            maxCents={maxCents}
          />
        ))}
      </div>
    </div>
  );
}
