'use client';

import { useState, useEffect } from 'react';
import { Lock, Delete, X } from 'lucide-react';
import { usePrivacy } from '@/lib/privacy/privacy-context';

const PAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export function PrivacyOverlay() {
  const { isUnlockOpen, closeUnlock, unlock } = usePrivacy();
  const [digits, setDigits] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);

  // Reset digits when dialog opens
  useEffect(() => {
    if (isUnlockOpen) {
      setDigits([]);
      setError(false);
      setShake(false);
    }
  }, [isUnlockOpen]);

  if (!isUnlockOpen) return null;

  async function handleDigit(key: string) {
    if (key === '⌫') {
      setDigits((d) => d.slice(0, -1));
      setError(false);
      return;
    }
    if (key === '') return;

    const next = [...digits, key];
    setDigits(next);

    if (next.length === 4) {
      const ok = await unlock(next.join(''));
      if (!ok) {
        setShake(true);
        setError(true);
        setTimeout(() => {
          setShake(false);
          setDigits([]);
        }, 600);
      }
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9980] bg-background/60 backdrop-blur-sm"
        onClick={closeUnlock}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-[9990] w-72 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={closeUnlock}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>

        <div className={`flex flex-col items-center gap-6 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>

          <div className="text-center">
            <h2 className="text-base font-semibold">Enter PIN to show amounts</h2>
            {error && (
              <p className="mt-1 text-xs text-destructive">Incorrect PIN. Try again.</p>
            )}
          </div>

          {/* Dot indicators */}
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full border-2 transition-colors duration-150 ${
                  digits.length > i
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-2">
            {PAD.map((key, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleDigit(key)}
                disabled={key === '' || digits.length >= 4}
                className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold transition-colors ${
                  key === ''
                    ? 'invisible'
                    : 'bg-muted hover:bg-accent active:scale-95 disabled:opacity-40'
                }`}
              >
                {key === '⌫' ? <Delete className="h-4 w-4" /> : key}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) translateX(0); }
          20% { transform: translate(-50%, -50%) translateX(-8px); }
          40% { transform: translate(-50%, -50%) translateX(8px); }
          60% { transform: translate(-50%, -50%) translateX(-6px); }
          80% { transform: translate(-50%, -50%) translateX(6px); }
        }
      `}</style>
    </>
  );
}
