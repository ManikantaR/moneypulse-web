import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

const required = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

for (const key of required) {
  if (!process.env[key]) {
    // Fail fast at runtime so missing env is obvious during setup.
    // This keeps secrets out of code and allows safe scaffolding in git.
    // eslint-disable-next-line no-console
    console.warn(`Missing env var: ${key}`);
  }
}

function requiredEnv(key: (typeof required)[number]): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required Firebase env var: ${key}`);
  }

  return value;
}

const firebaseConfig: FirebaseOptions = {
  apiKey: requiredEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: requiredEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: requiredEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  appId: requiredEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
if (messagingSenderId) {
  firebaseConfig.messagingSenderId = messagingSenderId;
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
