'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/use-auth';
import type { BudgetDoc } from '@/lib/types/firestore';

export function useBudgets() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  return useQuery({
    queryKey: ['budgets', uid],
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<BudgetDoc[]> => {
      if (!uid) return [];
      const db = firebaseDb();
      const q = query(collection(db, 'budgets'), where('userAliasId', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<BudgetDoc, 'id'>) }));
    },
  });
}
