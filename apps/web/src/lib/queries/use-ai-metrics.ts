'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/use-auth';
import type { AiMetricsDoc } from '@/lib/types/firestore';

export function useAiMetrics() {
  const { user } = useAuth();
  const [data, setData] = useState<AiMetricsDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const db = firebaseDb();
    const ref = doc(db, 'aiMetrics', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      setData(snap.exists() ? (snap.data() as AiMetricsDoc) : null);
      setIsLoading(false);
    });

    return unsub;
  }, [user]);

  return { data, isLoading };
}
