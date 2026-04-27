'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { bootstrapProfile, type UserProfile } from './profile';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  profile: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth(), (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        bootstrapProfile(firebaseDb(), firebaseUser.uid)
          .then(setProfile)
          .catch(() => {});
      } else {
        setProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext value={{ user, loading, profile }}>
      {children}
    </AuthContext>
  );
}
