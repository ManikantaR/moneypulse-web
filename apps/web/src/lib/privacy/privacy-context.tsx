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
  pinReady: boolean; // true once PIN hash loaded from Firestore
  lock: () => void;
  unlock: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  resetPin: () => Promise<void>;
}

const PrivacyContext = createContext<PrivacyContextValue>({
  isLocked: false,
  hasPin: false,
  pinReady: false,
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
  const [pinReady, setPinReady] = useState(false);
  // Start unlocked — useEffect applies sessionStorage state after hydration
  const [isLocked, setIsLocked] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read lock state from sessionStorage after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      setIsLocked(true);
    }
  }, []);

  // Load PIN hash from Firestore; once loaded restore lock state if needed
  useEffect(() => {
    if (!user?.uid) return;
    const db = firebaseDb();
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      const hash = (snap.data()?.privacyPinHash as string) ?? null;
      setPinHash(hash);
      setPinReady(true);
      // If there's no PIN but sessionStorage says locked, clear the stale state
      if (!hash) {
        setIsLocked(false);
        sessionStorage.removeItem(SESSION_KEY);
      }
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

  // Auto-lock after IDLE_MS of inactivity (only when PIN is set)
  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (!pinHash) return;
    idleTimer.current = setTimeout(() => setIsLocked(true), IDLE_MS);
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
      // Don't unlock if PIN hash hasn't loaded yet — wait for Firestore
      if (!pinReady) return false;
      if (!pinHash) {
        setIsLocked(false);
        return true;
      }
      const hash = await sha256(pin);
      if (hash === pinHash) {
        setIsLocked(false);
        resetIdle();
        return true;
      }
      return false;
    },
    [pinHash, pinReady, resetIdle],
  );

  const setPin = useCallback(
    async (pin: string) => {
      if (!user?.uid) return;
      const hash = await sha256(pin);
      const db = firebaseDb();
      await setDoc(doc(db, 'users', user.uid), { privacyPinHash: hash }, { merge: true });
      setPinHash(hash);
      setPinReady(true);
    },
    [user?.uid],
  );

  const resetPin = useCallback(async () => {
    if (!user?.uid) return;
    const db = firebaseDb();
    await updateDoc(doc(db, 'users', user.uid), { privacyPinHash: deleteField() });
    setPinHash(null);
    setIsLocked(false);
    sessionStorage.removeItem(SESSION_KEY);
  }, [user?.uid]);

  return (
    <PrivacyContext.Provider
      value={{ isLocked, hasPin: !!pinHash, pinReady, lock, unlock, setPin, resetPin }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}
