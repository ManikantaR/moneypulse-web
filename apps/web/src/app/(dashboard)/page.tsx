import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard — MoneyPulse' };

export default function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Waiting for sync data from local MoneyPulse…
      </p>
    </main>
  );
}
