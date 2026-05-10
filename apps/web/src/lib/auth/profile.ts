import { doc, getDoc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  createdAt: unknown;
  lastSeenAt: unknown;
  bootstrapped: boolean;
}

export async function bootstrapProfile(
  db: Firestore,
  uid: string,
): Promise<UserProfile> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await setDoc(ref, { lastSeenAt: serverTimestamp() }, { merge: true });
    return snap.data() as UserProfile;
  }

  const profile: UserProfile = {
    uid,
    createdAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
    bootstrapped: true,
  };
  await setDoc(ref, profile);
  return profile;
}
