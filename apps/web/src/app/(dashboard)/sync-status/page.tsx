'use client';

import type { Metadata } from 'next';
import { useSyncStats, type SyncAuditLogEntry } from '@/lib/hooks/useSyncStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// StatCard mirrors the pattern described in the ai-logs dashboard spec.
function StatCard({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number | string;
  variant?: 'default' | 'green' | 'yellow' | 'red';
}) {
  const variantClass =
    variant === 'green'
      ? 'text-green-600 dark:text-green-400'
      : variant === 'yellow'
        ? 'text-yellow-600 dark:text-yellow-400'
        : variant === 'red'
          ? 'text-red-600 dark:text-red-400'
          : 'text-foreground';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold tabular-nums ${variantClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function truncate(str: string, len = 12): string {
  if (!str) return '—';
  return str.length > len ? `${str.slice(0, len)}…` : str;
}

export default function SyncStatusPage() {
  const { data, isLoading, error, refetch } = useSyncStats();
  const [backfillUserId, setBackfillUserId] = useState('');
  const [backfillStatus, setBackfillStatus] = useState<string | null>(null);
  const [isBackfilling, setIsBackfilling] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  async function handleBackfill() {
    if (!backfillUserId.trim()) return;
    setIsBackfilling(true);
    setBackfillStatus(null);
    try {
      const res = await fetch(`${apiBase}/sync/backfill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: backfillUserId.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      setBackfillStatus(
        `Backfill complete: ${result.enqueued} enqueued, ${result.skipped} skipped (${result.durationMs}ms)`,
      );
      refetch();
    } catch (err) {
      setBackfillStatus(`Backfill failed: ${(err as Error).message}`);
    } finally {
      setIsBackfilling(false);
    }
  }

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Sync Status</h1>
        <p className="text-muted-foreground mt-1 text-sm">Loading…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Sync Status</h1>
        <p className="text-red-500 mt-2 text-sm">
          {error?.message ?? 'Failed to load sync stats.'}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sync Status</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Outbox pipeline health — auto-refreshes every 30 s
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Delivered" value={data.delivered} variant="green" />
        <StatCard label="Pending" value={data.pending} />
        <StatCard
          label="Retrying"
          value={data.retry}
          variant={data.retry > 0 ? 'yellow' : 'default'}
        />
        <StatCard
          label="Dead Letter"
          value={data.deadLetter}
          variant={data.deadLetter > 0 ? 'red' : 'default'}
        />
        <StatCard
          label="Policy Failures"
          value={data.policyFailed}
          variant={data.policyFailed > 0 ? 'red' : 'default'}
        />
      </div>

      {/* Last sync time */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            Last delivered at:{' '}
            <span className="font-medium text-foreground">
              {formatTime(data.lastDeliveredAt)}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Recent Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentAuditLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No audit log entries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-2 pr-4 font-medium">Time</th>
                    <th className="pb-2 pr-4 font-medium">Event ID</th>
                    <th className="pb-2 pr-4 font-medium">Policy</th>
                    <th className="pb-2 pr-4 font-medium">Attempt #</th>
                    <th className="pb-2 pr-4 font-medium">HTTP</th>
                    <th className="pb-2 font-medium">Error Code</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentAuditLogs.map((log: SyncAuditLogEntry) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">
                        {formatTime(log.createdAt)}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        {truncate(log.outboxEventId, 14)}
                      </td>
                      <td className="py-2 pr-4">
                        {log.policyPassed ? (
                          <span className="text-green-600 dark:text-green-400">Pass</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">Fail</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 tabular-nums">{log.attemptNo}</td>
                      <td className="py-2 pr-4 tabular-nums">
                        {log.httpStatus != null ? (
                          <span
                            className={
                              log.httpStatus >= 200 && log.httpStatus < 300
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {log.httpStatus}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2 text-muted-foreground">{log.errorCode ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trigger Backfill — Admin only */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trigger Backfill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Enqueue pre-existing transactions that have never been synced.
            Admin only. Safe to run multiple times.
          </p>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="User ID"
              value={backfillUserId}
              onChange={(e) => setBackfillUserId(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm flex-1 bg-background"
            />
            <Button
              onClick={handleBackfill}
              disabled={isBackfilling || !backfillUserId.trim()}
              size="sm"
            >
              {isBackfilling ? 'Running…' : 'Run Backfill'}
            </Button>
          </div>
          {backfillStatus && (
            <p
              className={`text-sm ${backfillStatus.startsWith('Backfill failed') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}
            >
              {backfillStatus}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
