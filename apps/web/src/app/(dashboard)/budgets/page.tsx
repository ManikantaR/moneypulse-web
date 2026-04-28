'use client';

import { Wallet } from 'lucide-react';
import { useBudgets } from '@/lib/queries/use-budgets';
import { useCategories } from '@/lib/queries/use-categories';
import { useTransactionsResult } from '@/lib/queries/use-transactions';
import { CategorySpendRow } from '@/components/categories/category-spend-row';

function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthYear: string): string {
  const [y, m] = monthYear.split('-').map(Number) as [number, number];
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function BudgetsPage() {
  const monthYear = getCurrentMonthYear();
  const [y, m] = monthYear.split('-').map(Number) as [number, number];
  const lastDay = new Date(y, m, 0).getDate();
  const startDate = `${monthYear}-01`;
  const endDate = `${monthYear}-${String(lastDay).padStart(2, '0')}`;

  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: transactions, isLoading: txLoading } = useTransactionsResult({ startDate, endDate });

  const isLoading = budgetsLoading || catLoading || txLoading;

  const catMap = new Map((categories ?? []).map((c) => [c.categoryId, c]));

  // Compute spend per category for current month
  const spendMap = new Map<string, number>();
  for (const txn of transactions) {
    if (txn.isCredit || !txn.categoryId) continue;
    spendMap.set(txn.categoryId, (spendMap.get(txn.categoryId) ?? 0) + txn.amountCents);
  }

  const budgetList = budgets ?? [];

  const totalBudgeted = budgetList.reduce((s, b) => s + b.amountCents, 0);
  const totalSpent = budgetList.reduce((s, b) => s + (b.categoryId ? (spendMap.get(b.categoryId) ?? 0) : 0), 0);
  const overBudgetCount = budgetList.filter(
    (b) => b.categoryId && (spendMap.get(b.categoryId) ?? 0) > b.amountCents,
  ).length;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Budgets</h1>
          <p className="text-sm text-muted-foreground">{formatMonthLabel(monthYear)}</p>
        </div>
      </div>

      {/* Summary strip */}
      {!isLoading && budgetList.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Budgeted</p>
            <p className="text-lg font-bold tabular-nums">
              {(totalBudgeted / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="rounded-xl border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className={`text-lg font-bold tabular-nums ${totalSpent > totalBudgeted ? 'text-destructive' : ''}`}>
              {(totalSpent / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="rounded-xl border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className={`text-lg font-bold tabular-nums ${totalBudgeted - totalSpent < 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
              {((totalBudgeted - totalSpent) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}

      {overBudgetCount > 0 && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
          {overBudgetCount} {overBudgetCount === 1 ? 'category is' : 'categories are'} over budget this month.
        </div>
      )}

      {/* Budget rows */}
      <div className="rounded-xl border bg-card p-4 space-y-4">
        {isLoading && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </>
        )}

        {!isLoading && budgetList.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Wallet className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No budgets synced yet.</p>
            <p className="text-xs text-muted-foreground">
              Create budgets in local MoneyPulse, then run a backfill from the Cloud Sync page.
            </p>
          </div>
        )}

        {!isLoading && budgetList.map((budget) => {
          const spentCents = budget.categoryId ? (spendMap.get(budget.categoryId) ?? 0) : 0;
          const cat = budget.categoryId ? (catMap.get(budget.categoryId) ?? null) : null;
          return (
            <CategorySpendRow
              key={budget.budgetId}
              category={cat}
              spentCents={spentCents}
              budgetCents={budget.amountCents}
              maxCents={Math.max(spentCents, budget.amountCents)}
            />
          );
        })}
      </div>
    </div>
  );
}
