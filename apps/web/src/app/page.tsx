'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (loading || redirected.current) return;
    redirected.current = true;
    router.replace(user ? '/dashboard' : '/login');
  }, [user, loading, router]);

  return null;
}
