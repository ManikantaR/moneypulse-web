'use client';

import { usePrivacy } from '@/lib/privacy/privacy-context';
import { cn } from '@/lib/utils';

interface BlurredAmountProps {
  className?: string;
  children: React.ReactNode;
  'data-testid'?: string;
  'data-variant'?: string;
}

export function BlurredAmount({ className, children, 'data-testid': testId, 'data-variant': dataVariant }: BlurredAmountProps) {
  const { isLocked } = usePrivacy();

  return (
    <span
      className={cn(
        className,
        isLocked && 'blur-sm select-none pointer-events-none',
      )}
      data-testid={testId}
      data-variant={dataVariant}
    >
      {children}
    </span>
  );
}
