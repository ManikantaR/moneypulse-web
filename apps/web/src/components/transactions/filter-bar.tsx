'use client';

import { cn } from '@/lib/utils';
import type { TransactionFilters } from '@/lib/queries/use-transactions';

type FilterPreset = 'all' | 'income' | 'expenses' | 'this-month' | 'last-month';

interface FilterBarProps {
  activePreset?: FilterPreset;
  onFilterChange: (filters: TransactionFilters, preset: FilterPreset) => void;
}

function getMonthRange(offset: 0 | -1): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1 + offset; // offset=-1 → last month
  const adjustedYear = month <= 0 ? year - 1 : year;
  const adjustedMonth = month <= 0 ? 12 + month : month;
  const lastDay = new Date(adjustedYear, adjustedMonth, 0).getDate();
  const mm = String(adjustedMonth).padStart(2, '0');
  return {
    startDate: `${adjustedYear}-${mm}-01`,
    endDate: `${adjustedYear}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}

const chips: { label: string; preset: FilterPreset }[] = [
  { label: 'All', preset: 'all' },
  { label: 'Income', preset: 'income' },
  { label: 'Expenses', preset: 'expenses' },
  { label: 'This month', preset: 'this-month' },
  { label: 'Last month', preset: 'last-month' },
];

function presetToFilters(preset: FilterPreset): TransactionFilters {
  switch (preset) {
    case 'income':
      return { isCredit: true };
    case 'expenses':
      return { isCredit: false };
    case 'this-month':
      return getMonthRange(0);
    case 'last-month':
      return getMonthRange(-1);
    default:
      return {};
  }
}

export function FilterBar({ activePreset = 'all', onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Transaction filters">
      {chips.map(({ label, preset }) => (
        <button
          key={preset}
          type="button"
          onClick={() => onFilterChange(presetToFilters(preset), preset)}
          aria-pressed={activePreset === preset}
          className={cn(
            'rounded-full border px-3 py-1 text-sm transition-colors',
            activePreset === preset
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-foreground hover:bg-muted',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
