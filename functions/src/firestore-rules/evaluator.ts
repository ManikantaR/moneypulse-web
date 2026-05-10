/**
 * Pure-TypeScript model of the Firestore security rule predicates defined in
 * firestore.rules. These functions mirror each `allow` condition exactly so
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
// /users/{userAliasId}  — root document
// ---------------------------------------------------------------------------

export function canReadWriteUserDoc(
  auth: AuthContext | null,
  userAliasId: string,
): boolean {
  return auth !== null && auth.uid === userAliasId;
}

// ---------------------------------------------------------------------------
// /users/{userAliasId}/overlays/{overlayId}
// /users/{userAliasId}/deviceTokens/{tokenId}
// (same predicate — own UID read/write)
// ---------------------------------------------------------------------------

export function canReadWriteUserSubCollection(
  auth: AuthContext | null,
  userAliasId: string,
): boolean {
  return auth !== null && auth.uid === userAliasId;
}

// ---------------------------------------------------------------------------
// /users/{userAliasId}/notifications/{notifId}
// ---------------------------------------------------------------------------

export function canReadNotification(
  auth: AuthContext | null,
  userAliasId: string,
): boolean {
  return auth !== null && auth.uid === userAliasId;
}

/** Only the isRead field may be changed; no other field mutations allowed. */
export function canUpdateNotification(
  auth: AuthContext | null,
  userAliasId: string,
  affectedKeys: string[],
): boolean {
  return (
    auth !== null &&
    auth.uid === userAliasId &&
    affectedKeys.length > 0 &&
    affectedKeys.every((k) => k === 'isRead')
  );
}

export function canCreateOrDeleteNotification(): boolean {
  return false;
}

// ---------------------------------------------------------------------------
// /syncIngressEvents/{eventId}
// ---------------------------------------------------------------------------

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

export function canWriteSyncIngressEvent(): boolean {
  return false;
}

// ---------------------------------------------------------------------------
// /transactions/{txnId}
// /categories/{catId}
// /budgets/{budgetDocId}
// (same predicate — read if userAliasId field matches uid; never write)
// ---------------------------------------------------------------------------

export function canReadProjectedDoc(
  auth: AuthContext | null,
  resourceData: ResourceData,
): boolean {
  return auth !== null && resourceData['userAliasId'] === auth.uid;
}

export function canWriteProjectedDoc(): boolean {
  return false;
}

// ---------------------------------------------------------------------------
// /aiMetrics/{userAliasId}
// ---------------------------------------------------------------------------

export function canReadAiMetrics(
  auth: AuthContext | null,
  userAliasId: string,
): boolean {
  return auth !== null && auth.uid === userAliasId;
}

export function canWriteAiMetrics(): boolean {
  return false;
}
