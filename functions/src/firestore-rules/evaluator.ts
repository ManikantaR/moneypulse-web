/**
 * Pure-TypeScript model of the Firestore security rule predicates defined in
 * firestore.rules.  These functions mirror each `allow` condition exactly so
 * that the security invariants can be validated in unit tests without running
 * the Firebase Emulator.
 *
 * IMPORTANT: whenever firestore.rules changes, the corresponding predicate
 * here must be kept in sync so the tests remain meaningful.
 */

export interface AuthContext {
  uid: string;
}

export interface ResourceData {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// /users/{userAliasId}
// ---------------------------------------------------------------------------

/**
 * Predicate for:
 *   match /users/{userAliasId} {
 *     allow read, write: if request.auth != null && request.auth.uid == userAliasId;
 *   }
 */
export function canReadWriteUserDoc(
  auth: AuthContext | null,
  userAliasId: string,
): boolean {
  return auth !== null && auth.uid === userAliasId;
}

// ---------------------------------------------------------------------------
// /users/{userAliasId}/{document=**}
// ---------------------------------------------------------------------------

/**
 * Predicate for:
 *   match /users/{userAliasId}/{document=**} {
 *     allow read, write: if request.auth != null && request.auth.uid == userAliasId;
 *   }
 */
export function canReadWriteUserSubCollection(
  auth: AuthContext | null,
  userAliasId: string,
): boolean {
  return auth !== null && auth.uid === userAliasId;
}

// ---------------------------------------------------------------------------
// /syncIngressEvents/{eventId}
// ---------------------------------------------------------------------------

/**
 * Predicate for:
 *   match /syncIngressEvents/{eventId} {
 *     allow read: if request.auth != null
 *                 && ('userAliasId' in resource.data)
 *                 && resource.data.userAliasId == request.auth.uid;
 *   }
 */
export function canReadSyncIngressEvent(
  auth: AuthContext | null,
  resourceData: ResourceData,
): boolean {
  return (
    auth !== null &&
    'userAliasId' in resourceData &&
    resourceData['userAliasId'] === auth.uid
  );
}

/**
 * Predicate for:
 *   match /syncIngressEvents/{eventId} {
 *     allow write: if false;
 *   }
 */
export function canWriteSyncIngressEvent(): boolean {
  return false;
}
