'use client';

import type { CategoryDoc } from '@/lib/types/firestore';
import { cn } from '@/lib/utils';

interface Props {
  category: CategoryDoc | null;
  spentCents: number;
  budgetCents: number | null;
  maxCents: number;
}

function fmt(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function CategorySpendRow({ category, spentCents, budgetCents, maxCents }: Props) {
  const label = category
    ? category.icon ? `${category.icon} ${category.name}` : category.name
    : 'Uncategorized';

  const pct = maxCents > 0 ? Math.min(Math.round((spentCents / maxCents) * 100), 100) : 0;
  const overBudget = budgetCents !== null && spentCents > budgetCents;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-semibold tabular-nums">
          {fmt(spentCents)}
          {budgetCents !== null && (
            <span className="ml-1 text-xs text-muted-foreground font-normal">/ {fmt(budgetCents)}</span>
          )}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn(
            'h-full rounded-full transition-all',
            overBudget ? 'bg-red-500' : 'bg-primary',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
