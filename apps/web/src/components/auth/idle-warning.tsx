'use client';

interface IdleWarningProps {
  secondsLeft: number;
  onStay: () => void;
}

export function IdleWarning({ secondsLeft, onStay }: IdleWarningProps) {
  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div className="flex items-center gap-4 rounded-xl border border-yellow-500/40 bg-card px-5 py-3.5 shadow-lg max-w-md w-full">
        <div className="flex-1">
          <p className="text-sm font-semibold">Signing out due to inactivity</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            You'll be logged out in <span className="font-semibold text-yellow-600 dark:text-yellow-400 tabular-nums">{secondsLeft}s</span>
          </p>
        </div>
        <button
          onClick={onStay}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Stay logged in
        </button>
      </div>
    </div>
  );
}
