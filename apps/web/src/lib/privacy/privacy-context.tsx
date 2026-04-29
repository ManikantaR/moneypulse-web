'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/use-auth';

const SESSION_KEY = 'mp_privacy_locked';
const IDLE_MS = 10 * 60 * 1000; // 10 minutes

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface PrivacyContextValue {
  isLocked: boolean;
  hasPin: boolean;
  lock: () => void;
  unlock: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  resetPin: () => Promise<void>;
}

const PrivacyContext = createContext<PrivacyContextValue>({
  isLocked: false,
  hasPin: false,
  lock: () => {},
  unlock: async () => false,
  setPin: async () => {},
  resetPin: async () => {},
});

export function usePrivacy() {
  return useContext(PrivacyContext);
}

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(() =>
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(SESSION_KEY) === '1'
      : false,
  );
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load PIN hash from Firestore on mount
  useEffect(() => {
    if (!user?.uid) return;
    const db = firebaseDb();
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      const data = snap.data();
      setPinHash((data?.privacyPinHash as string) ?? null);
    });
  }, [user?.uid]);

  // Persist lock state to sessionStorage
  useEffect(() => {
    if (isLocked) {
      sessionStorage.setItem(SESSION_KEY, '1');
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [isLocked]);

  // Auto-lock after IDLE_MS of inactivity
  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (!pinHash) return; // no pin = nothing to lock
    idleTimer.current = setTimeout(() => {
      setIsLocked(true);
    }, IDLE_MS);
  }, [pinHash]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'pointerdown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetIdle]);

  const lock = useCallback(() => {
    if (pinHash) setIsLocked(true);
  }, [pinHash]);

  const unlock = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!pinHash) return true;
      const hash = await sha256(pin);
      if (hash === pinHash) {
        setIsLocked(false);
        resetIdle();
        return true;
      }
      return false;
    },
    [pinHash, resetIdle],
  );

  const setPin = useCallback(
    async (pin: string) => {
      if (!user?.uid) return;
      const hash = await sha256(pin);
      const db = firebaseDb();
      await setDoc(doc(db, 'users', user.uid), { privacyPinHash: hash }, { merge: true });
      setPinHash(hash);
    },
    [user?.uid],
  );

  const resetPin = useCallback(async () => {
    if (!user?.uid) return;
    const db = firebaseDb();
    await updateDoc(doc(db, 'users', user.uid), { privacyPinHash: deleteField() });
    setPinHash(null);
    setIsLocked(false);
  }, [user?.uid]);

  return (
    <PrivacyContext.Provider
      value={{ isLocked, hasPin: !!pinHash, lock, unlock, setPin, resetPin }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}
