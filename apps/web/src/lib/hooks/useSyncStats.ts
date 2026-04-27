'use client';

import { useQuery } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface SyncAuditLogEntry {
  id: number;
  outboxEventId: string;
  action: string;
  policyPassed: boolean;
  attemptNo: number;
  httpStatus: number | null;
  errorCode: string | null;
  createdAt: string;
}

export interface SyncStats {
  pending: number;
  retry: number;
  delivered: number;
  policyFailed: number;
  deadLetter: number;
  lastDeliveredAt: string | null;
  recentAuditLogs: SyncAuditLogEntry[];
}

async function fetchSyncStats(): Promise<SyncStats> {
  const res = await fetch(`${API_BASE}/sync/stats`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch sync stats: ${res.status}`);
  }
  return res.json() as Promise<SyncStats>;
}

export interface UseSyncStatsResult {
  data: SyncStats | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches aggregate outbox status counts and recent audit logs
 * from the local MoneyPulse API (`GET /sync/stats`).
 *
 * Refreshes every 30 seconds automatically.
 */
export function useSyncStats(): UseSyncStatsResult {
  const { data, isLoading, error, refetch } = useQuery<SyncStats, Error>({
    queryKey: ['syncStats'],
    queryFn: fetchSyncStats,
    refetchInterval: 30_000,
  });

  return {
    data,
    isLoading,
    error: error ?? null,
    refetch,
  };
}
