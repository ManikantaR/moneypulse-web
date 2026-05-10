'use client';

import { useAuth } from '@/lib/auth/use-auth';
import { useSyncFreshness } from '@/lib/queries/use-sync-freshness';
import { useTransactionsResult } from '@/lib/queries/use-transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, CloudUpload, Clock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function SyncStatusPage() {
  const { user } = useAuth();
  const { lastSyncAt, isStale } = useSyncFreshness();
  const { data: transactions, isLoading: txLoading } = useTransactionsResult();
  const [copied, setCopied] = useState(false);

  function copyUid() {
    if (!user?.uid) return;
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const lastSyncLabel = lastSyncAt
    ? formatDistanceToNow(lastSyncAt, { addSuffix: true })
    : 'Never synced';

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Cloud Sync</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Your Firebase account and sync health
        </p>
      </div>

      {/* Firebase UID — copy into MoneyPulse local app to link */}
      {user?.uid && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Firebase UID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Copy this into <strong>MoneyPulse</strong> → Cloud Sync → "Link Firebase Account"
              to connect your local data to this account.
            </p>
            <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
              <span className="flex-1 font-mono text-xs break-all select-all">{user.uid}</span>
              <button
                onClick={copyUid}
                title="Copy UID"
                className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied
                  ? <Check className="h-4 w-4 text-green-500" />
                  : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync freshness */}
      <Card className={isStale ? 'border-yellow-500/40' : 'border-green-500/40'}>
        <CardContent className="pt-5 flex items-start gap-3">
          {isStale
            ? <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            : <CloudUpload className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />}
          <div>
            <p className="text-sm font-medium">
              {isStale ? 'Sync is stale' : 'Sync is up to date'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last synced: <span className="font-medium">{lastSyncLabel}</span>
            </p>
            {isStale && (
              <p className="text-xs text-muted-foreground mt-1">
                Open MoneyPulse on your local machine and run a backfill from the Cloud Sync page.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction count */}
      <Card>
        <CardContent className="pt-5 flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium">
              {txLoading
                ? 'Loading…'
                : `${transactions.length.toLocaleString()} transaction${transactions.length !== 1 ? 's' : ''} in cloud`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Across all time. Filtered by your account only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
