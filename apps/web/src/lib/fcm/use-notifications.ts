'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/use-auth';
import type { NotificationDoc } from '@/lib/types/firestore';

export function useNotifications(maxItems = 50) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const db = firebaseDb();
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(maxItems),
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as NotificationDoc));
      setIsLoading(false);
    });

    return unsub;
  }, [user, maxItems]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, isLoading };
}
