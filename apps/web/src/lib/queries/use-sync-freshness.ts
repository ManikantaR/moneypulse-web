'use client';

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, type Timestamp } from 'firebase/firestore';
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

      // Primary: user doc lastSyncAt (written by function on each delivery)
      const userDoc = await getDoc(doc(db, 'users', uid));
      const lastSyncRaw = userDoc.data()?.lastSyncAt as Timestamp | undefined;
      if (lastSyncRaw) return lastSyncRaw.toDate();

      // Fallback: most recent ingress event for this user
      const q = query(
        collection(db, 'syncIngressEvents'),
        where('userAliasId', '==', uid),
        orderBy('receivedAt', 'desc'),
        limit(1),
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const receivedAt = snap.docs[0]!.data().receivedAt as Timestamp | undefined;
      return receivedAt ? receivedAt.toDate() : null;
    },
  });

  const lastSyncAt = data ?? null;
  const isStale =
    lastSyncAt === null ||
    Date.now() - lastSyncAt.getTime() > STALE_THRESHOLD_MS;

  return { lastSyncAt, isStale };
}
