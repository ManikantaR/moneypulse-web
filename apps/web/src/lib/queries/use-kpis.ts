'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/use-auth';
import type { TransactionDoc } from '@/lib/types/firestore';

export interface KpiResult {
  income: number;
  expenses: number;
  cashFlow: number;
  isLoading: boolean;
  isEmpty: boolean;
}

export function useKpis(monthYear: string): KpiResult {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  // Derive start/end dates for the month
  const monthParts = monthYear.split('-').map(Number);
  const year = monthParts[0]!;
  const month = monthParts[1]!;
  const startDate = `${monthYear}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${monthYear}-${String(lastDay).padStart(2, '0')}`;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['kpis', uid, monthYear],
    enabled: !!uid,
    queryFn: async (): Promise<TransactionDoc[]> => {
      if (!uid) return [];
      const db = firebaseDb();
      const q = query(
        collection(db, 'transactions'),
        where('userAliasId', '==', uid),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc'),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<TransactionDoc, 'id'>),
      }));
    },
  });

  const transactions = data ?? [];
  const income = transactions
    .filter((t) => t.isCredit)
    .reduce((sum, t) => sum + t.amountCents, 0);
  const expenses = transactions
    .filter((t) => !t.isCredit)
    .reduce((sum, t) => sum + t.amountCents, 0);

  return {
    income,
    expenses,
    cashFlow: income - expenses,
    isLoading: isLoading && !isError,
    isEmpty: !isLoading && !isError && transactions.length === 0,
  };
}
