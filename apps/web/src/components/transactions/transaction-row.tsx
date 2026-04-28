'use client';

import { cn } from '@/lib/utils';
import type { TransactionDoc } from '@/lib/types/firestore';

interface TransactionRowProps {
  transaction: TransactionDoc;
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

function formatDate(iso: string): string {
  // Parse as local date to avoid TZ shift
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

export function TransactionRow({ transaction }: TransactionRowProps) {
  const { date, amountCents, isCredit, isManual, categoryId } = transaction;

  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm">{formatDate(date)}</span>
        <div className="flex gap-1.5">
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {categoryId ? 'Categorized' : 'Uncategorized'}
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
          'text-sm font-semibold tabular-nums',
          isCredit
            ? 'text-green-600 dark:text-green-400'
            : 'text-destructive',
        )}
        data-testid="amount"
      >
        {isCredit ? '+' : '-'}
        {formatCents(amountCents)}
      </span>
    </div>
  );
}
