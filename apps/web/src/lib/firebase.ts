import {
  initializeApp,
  getApps,
  getApp as getFirebaseApp,
  type FirebaseApp,
  type FirebaseOptions,
} from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getMessaging, type Messaging } from 'firebase/messaging';

// Firebase client config is public — safe in browser bundle.
// Never put secrets (signing keys, admin credentials) here.
function buildConfig(): FirebaseOptions {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error(
      'Missing Firebase config. Ensure NEXT_PUBLIC_FIREBASE_* env vars are set.',
    );
  }

  const config: FirebaseOptions = { apiKey, authDomain, projectId, appId };
  const sender = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  if (sender) config.messagingSenderId = sender;
  return config;
}

function getApp(): FirebaseApp {
  return getApps().length ? getFirebaseApp() : initializeApp(buildConfig());
}

// All singletons are lazily initialised — getters are only called from client
// components inside effects, never during SSR module evaluation.
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _messaging: Messaging | null | undefined;

export function firebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getApp());
  return _auth;
}

export function firebaseDb(): Firestore {
  if (!_db) _db = getFirestore(getApp());
  return _db;
}

export function firebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;
  if (_messaging === undefined) _messaging = getMessaging(getApp());
  return _messaging;
}
