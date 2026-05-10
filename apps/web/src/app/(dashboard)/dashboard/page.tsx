'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FreshnessBanner } from '@/components/dashboard/freshness-banner';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { useKpis } from '@/lib/queries/use-kpis';
import { useTransactionsResult } from '@/lib/queries/use-transactions';
import { useCategoryMap } from '@/lib/queries/use-categories';
import { SpendingByCategory } from '@/components/dashboard/spending-by-category';

function getCurrentMonthYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function stepMonth(monthYear: string, delta: -1 | 1): string {
  const parts = monthYear.split('-').map(Number);
  const y = parts[0]!;
  const m = parts[1]!;
  const date = new Date(y, m - 1 + delta, 1);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, '0');
  return `${ny}-${nm}`;
}

function formatMonthLabel(monthYear: string): string {
  const parts = monthYear.split('-').map(Number);
  const year = parts[0]!;
  const month = parts[1]!;
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear);

  // KPIs for selected month
  const kpis = useKpis(monthYear);
  const categoryMap = useCategoryMap();

  // Last 10 transactions for the selected month (no filter = all for that month)
  const startDate = `${monthYear}-01`;
  const monthParts = monthYear.split('-').map(Number);
  const yr = monthParts[0]!;
  const mo = monthParts[1]!;
  const lastDay = new Date(yr, mo, 0).getDate();
  const endDate = `${monthYear}-${String(lastDay).padStart(2, '0')}`;
  const { data: transactions, isLoading: txLoading, isEmpty } = useTransactionsResult({
    startDate,
    endDate,
  });

  const recentTransactions = transactions.slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-4">
        <FreshnessBanner />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
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

      {/* KPI Cards */}
      <section aria-label="KPI summary" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Income"
          amountCents={kpis.income}
          variant="income"
          isLoading={kpis.isLoading}
        />
        <KpiCard
          label="Expenses"
          amountCents={kpis.expenses}
          variant="expense"
          isLoading={kpis.isLoading}
        />
        <KpiCard
          label="Cash Flow"
          amountCents={kpis.cashFlow}
          variant="cashflow"
          isLoading={kpis.isLoading}
        />
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Link
            href="/transactions"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>

        {txLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        )}

        {!txLoading && isEmpty && <EmptyState />}

        {!txLoading && !isEmpty && (
          <div className="rounded-xl border bg-card p-4">
            {recentTransactions.map((txn) => (
              <TransactionRow key={txn.id} transaction={txn} categoryMap={categoryMap} />
            ))}
          </div>
        )}
      </section>

      {!txLoading && !isEmpty && (
        <SpendingByCategory transactions={transactions} categoryMap={categoryMap} />
      )}
    </div>
  );
}
