'use client';

import { cn } from '@/lib/utils';
import type { TransactionDoc, CategoryDoc } from '@/lib/types/firestore';

interface TransactionRowProps {
  transaction: TransactionDoc;
  categoryMap?: Map<string, CategoryDoc>;
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

function formatDate(iso: string): string {
  const datePart = iso.split('T')[0] ?? iso;
  const parts = datePart.split('-').map(Number);
  const year = parts[0]!;
  const month = parts[1]!;
  const day = parts[2]!;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TransactionRow({ transaction, categoryMap }: TransactionRowProps) {
  const { date, amountCents, isCredit, isManual, categoryId, merchantName } = transaction;
  const category = categoryId ? categoryMap?.get(categoryId) : undefined;
  const categoryLabel = category?.icon
    ? `${category.icon} ${category.name}`
    : category?.name ?? (categoryId ? 'Categorized' : 'Uncategorized');

  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        {merchantName && (
          <span className="text-sm font-medium truncate">{merchantName}</span>
        )}
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-xs text-muted-foreground">{formatDate(date)}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {categoryLabel}
          </span>
          {isManual && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              manual
            </span>
          )}
        </div>
      </div>
      <span
        className={cn(
          'text-sm font-semibold tabular-nums shrink-0',
          isCredit ? 'text-green-600 dark:text-green-400' : 'text-destructive',
        )}
        data-testid="amount"
      >
        {isCredit ? '+' : '-'}
        {formatCents(amountCents)}
      </span>
    </div>
  );
}
