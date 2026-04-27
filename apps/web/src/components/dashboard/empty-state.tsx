'use client';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-lg font-semibold text-muted-foreground">No data yet</p>
      <p className="text-sm text-muted-foreground">
        Run a sync from your local MoneyPulse app.
      </p>
    </div>
  );
}
