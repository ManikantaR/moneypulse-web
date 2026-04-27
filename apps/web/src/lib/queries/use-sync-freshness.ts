'use client';

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/use-auth';

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface SyncFreshnessResult {
  lastSyncAt: Date | null;
  isStale: boolean;
}

export function useSyncFreshness(): SyncFreshnessResult {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const { data } = useQuery({
    queryKey: ['syncFreshness', uid],
    enabled: !!uid,
    queryFn: async (): Promise<Date | null> => {
      if (!uid) return null;
      const db = firebaseDb();
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) return null;
      const raw = userDoc.data()?.lastSyncAt as Timestamp | undefined;
      if (!raw) return null;
      return raw.toDate();
    },
  });

  const lastSyncAt = data ?? null;
  const isStale =
    lastSyncAt === null ||
    Date.now() - lastSyncAt.getTime() > STALE_THRESHOLD_MS;

  return { lastSyncAt, isStale };
}
