'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/use-auth';
import type { CategoryDoc } from '@/lib/types/firestore';

export function useCategories() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  return useQuery({
    queryKey: ['categories', uid],
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<CategoryDoc[]> => {
      if (!uid) return [];
      const db = firebaseDb();
      const q = query(collection(db, 'categories'), where('userAliasId', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<CategoryDoc, 'id'>) }));
    },
  });
}

export function useCategoryMap(): Map<string, CategoryDoc> {
  const { data } = useCategories();
  const map = new Map<string, CategoryDoc>();
  for (const cat of data ?? []) {
    map.set(cat.categoryId, cat);
  }
  return map;
}
