import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-4">
      {children}
    </div>
  );
}
