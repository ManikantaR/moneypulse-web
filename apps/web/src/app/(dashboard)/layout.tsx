'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/use-auth';
import { useIdleLogout } from '@/lib/auth/use-idle-logout';
import { getQueryClient } from '@/lib/query-client';
import { Sidebar, MobileNav } from '@/components/layout/sidebar';
import { IdleWarning } from '@/components/auth/idle-warning';
import { PrivacyProvider } from '@/lib/privacy/privacy-context';
import { PrivacyOverlay } from '@/components/privacy/privacy-overlay';

function DashboardShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const { warningVisible, secondsLeft, reset } = useIdleLogout(signOut);

  return (
    <PrivacyProvider>
      <div className="flex min-h-svh">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>
        <MobileNav />
        {warningVisible && <IdleWarning secondsLeft={secondsLeft} onStay={reset} />}
        <PrivacyOverlay />
      </div>
    </PrivacyProvider>
  );
}

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
      <DashboardShell>{children}</DashboardShell>
    </QueryClientProvider>
  );
}
