'use client';

import { useState } from 'react';
import { Lock, Delete } from 'lucide-react';
import { usePrivacy } from '@/lib/privacy/privacy-context';

const PAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export function PrivacyOverlay() {
  const { isLocked, unlock } = usePrivacy();
  const [digits, setDigits] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);

  if (!isLocked) return null;

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
    <div className="fixed inset-0 z-[9990] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
      <div className={`flex flex-col items-center gap-8 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold">Enter PIN to unlock</h2>
          {error && (
            <p className="mt-1 text-sm text-destructive">Incorrect PIN. Try again.</p>
          )}
        </div>

        {/* Dot indicators */}
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full border-2 transition-colors duration-150 ${
                digits.length > i
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground/40 bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3">
          {PAD.map((key, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleDigit(key)}
              disabled={key === '' || digits.length >= 4}
              className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold transition-colors ${
                key === ''
                  ? 'invisible'
                  : 'bg-card border border-border hover:bg-accent active:scale-95 disabled:opacity-40'
              }`}
            >
              {key === '⌫' ? <Delete className="h-5 w-5" /> : key}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
