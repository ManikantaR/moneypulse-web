'use client';

import { useState } from 'react';
import { Lock, LockOpen, ShieldCheck, Trash2, Eye, EyeOff } from 'lucide-react';
import { usePrivacy } from '@/lib/privacy/privacy-context';

type Flow = null | 'set-pin' | 'confirm-pin' | 'reset-confirm';

export default function SettingsPage() {
  const { hasPin, setPin, resetPin } = usePrivacy();
  const [flow, setFlow] = useState<Flow>(null);
  const [firstPin, setFirstPin] = useState('');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPin, setShowPin] = useState(false);

  function reset() {
    setFlow(null);
    setInput('');
    setFirstPin('');
    setError('');
    setShowPin(false);
  }

  async function handleNext() {
    if (input.length !== 4 || !/^\d{4}$/.test(input)) {
      setError('PIN must be exactly 4 digits.');
      return;
    }

    if (flow === 'set-pin') {
      setFirstPin(input);
      setInput('');
      setError('');
      setFlow('confirm-pin');
      return;
    }

    if (flow === 'confirm-pin') {
      if (input !== firstPin) {
        setError('PINs do not match. Try again.');
        setInput('');
        return;
      }
      await setPin(input);
      setSuccess('Privacy PIN set. Numbers will blur when you lock the screen.');
      reset();
      return;
    }
  }

  async function handleReset() {
    await resetPin();
    setFlow(null);
    setSuccess('Privacy PIN removed.');
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>

      {/* Privacy PIN card */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Privacy PIN</h2>
            <p className="text-xs text-muted-foreground">
              Blur financial numbers for demos or shared screens. Auto-locks after 10 min idle.
            </p>
          </div>
        </div>

        {success && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-2.5 text-sm text-green-600 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-2.5">
          {hasPin
            ? <><LockOpen className="h-4 w-4 text-green-500" /><span className="text-sm">PIN is set — lock icon appears in the sidebar and bottom nav.</span></>
            : <><Lock className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">No PIN set. Set one to enable privacy mode.</span></>
          }
        </div>

        {/* PIN entry flow */}
        {(flow === 'set-pin' || flow === 'confirm-pin') && (
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">
              {flow === 'set-pin' ? 'Enter a 4-digit PIN' : 'Confirm your PIN'}
            </p>
            <div className="flex items-center gap-2">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                value={input}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setInput(v);
                  setError('');
                }}
                className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
              <button
                type="button"
                onClick={() => setShowPin((s) => !s)}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleNext}
                disabled={input.length !== 4}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {flow === 'set-pin' ? 'Next' : 'Confirm'}
              </button>
              <button
                onClick={reset}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {flow === 'reset-confirm' && (
          <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm">
              This will remove your privacy PIN. You can set a new one anytime.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove PIN
              </button>
              <button
                onClick={() => setFlow(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {flow === null && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setFlow('set-pin'); setSuccess(''); }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {hasPin ? 'Change PIN' : 'Set PIN'}
            </button>
            {hasPin && (
              <button
                onClick={() => { setFlow('reset-confirm'); setSuccess(''); }}
                className="flex items-center gap-1.5 rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove PIN
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
