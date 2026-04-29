'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BlurredAmount } from '@/components/privacy/blurred-amount';

export interface KpiCardProps {
  label: string;
  amountCents: number;
  variant: 'income' | 'expense' | 'cashflow';
  isLoading?: boolean;
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

const variantStyles: Record<KpiCardProps['variant'], string> = {
  income: 'text-green-600 dark:text-green-400',
  expense: 'text-destructive',
  cashflow: 'text-primary',
};

export function KpiCard({ label, amountCents, variant, isLoading }: KpiCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            aria-label="loading"
            className="h-8 w-32 animate-pulse rounded bg-muted"
          />
        ) : (
          <BlurredAmount
            className={cn('text-2xl font-bold tabular-nums', variantStyles[variant])}
            data-testid={`kpi-${variant}`}
            data-variant={variant}
          >
            {formatCents(amountCents)}
          </BlurredAmount>
        )}
      </CardContent>
    </Card>
  );
}
