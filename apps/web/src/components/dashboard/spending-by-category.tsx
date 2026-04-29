'use client';

import type { TransactionDoc, CategoryDoc } from '@/lib/types/firestore';
import { BlurredAmount } from '@/components/privacy/blurred-amount';

interface Props {
  transactions: TransactionDoc[];
  categoryMap: Map<string, CategoryDoc>;
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function SpendingByCategory({ transactions, categoryMap }: Props) {
  const expenses = transactions.filter((t) => !t.isCredit);

  if (expenses.length === 0) return null;

  // Aggregate spending per category
  const totals = new Map<string, number>();
  for (const txn of expenses) {
    const key = txn.categoryId ?? '__none__';
    totals.set(key, (totals.get(key) ?? 0) + txn.amountCents);
  }

  const sorted = [...totals.entries()]
    .sort((a, b) => b[1] - a[1]);

  const max = sorted[0]?.[1] ?? 1;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">Spending by Category</h2>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        {sorted.map(([key, cents]) => {
          const cat = key !== '__none__' ? categoryMap.get(key) : undefined;
          const label = cat?.icon ? `${cat.icon} ${cat.name}` : cat?.name ?? 'Uncategorized';
          const pct = Math.round((cents / max) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{label}</span>
                <BlurredAmount className="text-sm font-semibold tabular-nums">{formatCents(cents)}</BlurredAmount>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
