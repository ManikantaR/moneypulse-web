'use client';

import { useEffect, useRef } from 'react';
import { getToken } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseMessaging, firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/use-auth';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

function userAgentFingerprint(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  // Only store platform class, not the full UA string
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios-web';
  if (/Android/.test(ua)) return 'android-web';
  if (/Mac/.test(ua)) return 'mac-web';
  if (/Win/.test(ua)) return 'win-web';
  return 'other-web';
}

async function sendFirebaseConfig() {
  const reg = await navigator.serviceWorker.ready;
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };
  reg.active?.postMessage({ type: 'FIREBASE_CONFIG', config });
}

export function useFcmToken() {
  const { user } = useAuth();
  const registered = useRef(false);

  useEffect(() => {
    if (!user || registered.current || !VAPID_KEY) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    async function register() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await sendFirebaseConfig();

        const messaging = firebaseMessaging();
        if (!messaging) return;

        const token = await getToken(messaging, { vapidKey: VAPID_KEY! });
        if (!token) return;

        // Use a stable doc ID derived from token hash so rotation is idempotent
        const tokenId = btoa(token).slice(0, 32).replace(/[+/=]/g, '_');
        const db = firebaseDb();
        await setDoc(
          doc(db, 'users', user!.uid, 'deviceTokens', tokenId),
          {
            token,
            platform: 'web',
            platformDetail: userAgentFingerprint(),
            userAliasId: user!.uid,
            lastSeenAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );

        registered.current = true;
      } catch {
        // Permission denied or messaging unsupported — silent fail
      }
    }

    register();
  }, [user]);
}
