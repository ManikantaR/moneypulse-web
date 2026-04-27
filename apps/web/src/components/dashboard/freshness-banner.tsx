'use client';

import { formatDistanceToNow } from 'date-fns';
import { useSyncFreshness } from '@/lib/queries/use-sync-freshness';
import { cn } from '@/lib/utils';

export function FreshnessBanner() {
  const { lastSyncAt, isStale } = useSyncFreshness();

  const message =
    lastSyncAt === null
      ? 'Never synced — open MoneyPulse on your local machine to sync'
      : `Last synced ${formatDistanceToNow(lastSyncAt, { addSuffix: true })}`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'rounded-md px-4 py-2 text-sm',
        isStale
          ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          : 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      )}
    >
      {message}
    </div>
  );
}
