'use client';

import { useQuery } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  type QueryConstraint,
} from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/use-auth';
import type { TransactionDoc } from '@/lib/types/firestore';

export interface TransactionFilters {
  categoryId?: string;
  isCredit?: boolean;
  startDate?: string;
  endDate?: string;
}

export function useTransactions(filters?: TransactionFilters) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  return useQuery({
    queryKey: ['transactions', uid, filters ?? {}],
    enabled: !!uid,
    queryFn: async (): Promise<TransactionDoc[]> => {
      if (!uid) return [];

      const db = firebaseDb();
      const constraints: QueryConstraint[] = [
        where('userAliasId', '==', uid),
      ];

      if (filters?.categoryId !== undefined) {
        constraints.push(where('categoryId', '==', filters.categoryId));
      }
      if (filters?.isCredit !== undefined) {
        constraints.push(where('isCredit', '==', filters.isCredit));
      }
      if (filters?.startDate !== undefined) {
        constraints.push(where('date', '>=', filters.startDate));
      }
      if (filters?.endDate !== undefined) {
        constraints.push(where('date', '<=', filters.endDate));
      }

      constraints.push(orderBy('date', 'desc'));

      const q = query(collection(db, 'transactions'), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<TransactionDoc, 'id'>),
      }));
    },
    select: (data) => data,
  });
}

export function useTransactionsResult(filters?: TransactionFilters) {
  const result = useTransactions(filters);
  return {
    data: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    isEmpty: !result.isLoading && !result.isError && (result.data ?? []).length === 0,
  };
}
