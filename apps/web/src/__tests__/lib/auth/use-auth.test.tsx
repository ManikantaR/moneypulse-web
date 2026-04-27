import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('@/lib/firebase', () => ({
  firebaseAuth: vi.fn(() => ({})),
  firebaseDb: vi.fn(() => ({})),
  firebaseMessaging: vi.fn(() => null),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(() =>
    Promise.resolve({ exists: () => false, data: () => undefined }),
  ),
  setDoc: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

import { onAuthStateChanged } from 'firebase/auth';
import { AuthProvider } from '@/lib/auth/auth-provider';
import { useAuth } from '@/lib/auth/use-auth';

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true initially', () => {
    vi.mocked(onAuthStateChanged).mockImplementation(() => () => {});
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('returns user null when unauthenticated', async () => {
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      (callback as (u: null) => void)(null);
      return () => {};
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it('returns user when authenticated', async () => {
    const mockUser = { uid: 'uid-abc', email: 'test@example.com' };
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      (callback as (u: typeof mockUser) => void)(mockUser);
      return () => {};
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.uid).toBe('uid-abc');
  });
});
