'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/use-auth';
import { getQueryClient } from '@/lib/query-client';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (!loading && !user) return null;

  return (
    <QueryClientProvider client={getQueryClient()}>
      <div className="min-h-svh">{children}</div>
    </QueryClientProvider>
  );
}
