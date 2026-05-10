'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const IDLE_MS = 20 * 60 * 1000;   // 20 minutes — sign out
const WARN_MS = 60 * 1000;         // warn 60 s before

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'] as const;

export interface IdleLogoutState {
  warningVisible: boolean;
  secondsLeft: number;
  reset: () => void;
}

export function useIdleLogout(onLogout: () => void): IdleLogoutState {
  const [warningVisible, setWarningVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setWarningVisible(false);
    setSecondsLeft(60);

    warnTimer.current = setTimeout(() => {
      setWarningVisible(true);
      setSecondsLeft(60);

      countdownInterval.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (countdownInterval.current) clearInterval(countdownInterval.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }, IDLE_MS - WARN_MS);

    logoutTimer.current = setTimeout(() => {
      clearTimers();
      setWarningVisible(false);
      onLogout();
    }, IDLE_MS);
  }, [clearTimers, onLogout]);

  useEffect(() => {
    reset();

    const handler = () => {
      if (!warningVisible) reset();
    };

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, handler));
    };
  }, [reset, clearTimers, warningVisible]);

  return { warningVisible, secondsLeft, reset };
}
