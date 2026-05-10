import { describe, expect, it } from 'vitest';
import {
  canReadWriteUserDoc,
  canReadWriteUserSubCollection,
  canReadNotification,
  canUpdateNotification,
  canCreateOrDeleteNotification,
  canReadSyncIngressEvent,
  canWriteSyncIngressEvent,
  canReadProjectedDoc,
  canWriteProjectedDoc,
  canReadAiMetrics,
  canWriteAiMetrics,
} from '../firestore-rules/evaluator.js';

// ---------------------------------------------------------------------------
// /users/{userAliasId}
// ---------------------------------------------------------------------------

describe('Firestore rules — /users/{userAliasId}', () => {
  it('allows read/write when auth uid matches the path alias', () => {
    expect(canReadWriteUserDoc({ uid: 'alice' }, 'alice')).toBe(true);
  });

  it('denies read/write when auth uid does not match the path alias', () => {
    expect(canReadWriteUserDoc({ uid: 'alice' }, 'bob')).toBe(false);
  });

  it('denies read/write when unauthenticated', () => {
    expect(canReadWriteUserDoc(null, 'alice')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// /users/{userAliasId}/overlays  and  /deviceTokens  (same predicate)
// ---------------------------------------------------------------------------

describe('Firestore rules — /users/{userAliasId}/overlays and deviceTokens', () => {
  it('allows read/write when auth uid matches the path alias', () => {
    expect(canReadWriteUserSubCollection({ uid: 'alice' }, 'alice')).toBe(true);
  });

  it('denies read/write when auth uid does not match the path alias', () => {
    expect(canReadWriteUserSubCollection({ uid: 'alice' }, 'bob')).toBe(false);
  });

  it('denies read/write when unauthenticated', () => {
    expect(canReadWriteUserSubCollection(null, 'alice')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// /users/{userAliasId}/notifications/{notifId}
// ---------------------------------------------------------------------------

describe('Firestore rules — notifications reads', () => {
  it('allows read when authenticated user owns the notification', () => {
    expect(canReadNotification({ uid: 'alice' }, 'alice')).toBe(true);
  });

  it('denies read when uid does not match alias', () => {
    expect(canReadNotification({ uid: 'alice' }, 'bob')).toBe(false);
  });

  it('denies read when unauthenticated', () => {
    expect(canReadNotification(null, 'alice')).toBe(false);
  });
});

describe('Firestore rules — notifications updates (isRead only)', () => {
  it('allows update when only isRead field is changed', () => {
    expect(canUpdateNotification({ uid: 'alice' }, 'alice', ['isRead'])).toBe(true);
  });

  it('denies update when non-isRead field is included', () => {
    expect(canUpdateNotification({ uid: 'alice' }, 'alice', ['isRead', 'title'])).toBe(false);
  });

  it('denies update when uid does not match alias', () => {
    expect(canUpdateNotification({ uid: 'alice' }, 'bob', ['isRead'])).toBe(false);
  });

  it('denies update when unauthenticated', () => {
    expect(canUpdateNotification(null, 'alice', ['isRead'])).toBe(false);
  });
});

describe('Firestore rules — notifications create/delete', () => {
  it('always denies create and delete from browser', () => {
    expect(canCreateOrDeleteNotification()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// /syncIngressEvents/{eventId} — reads
// ---------------------------------------------------------------------------

describe('Firestore rules — /syncIngressEvents/{eventId} reads', () => {
  it('allows read when authenticated user owns the event', () => {
    expect(
      canReadSyncIngressEvent({ uid: 'alice' }, { userAliasId: 'alice', eventType: 'tx.v1' }),
    ).toBe(true);
  });

  it('denies read when authenticated user does not own the event', () => {
    expect(
      canReadSyncIngressEvent({ uid: 'alice' }, { userAliasId: 'bob', eventType: 'tx.v1' }),
    ).toBe(false);
  });

  it('denies read when document is missing the userAliasId field', () => {
    expect(
      canReadSyncIngressEvent({ uid: 'alice' }, { eventType: 'tx.v1' }),
    ).toBe(false);
  });

  it('denies read when unauthenticated', () => {
    expect(
      canReadSyncIngressEvent(null, { userAliasId: 'alice', eventType: 'tx.v1' }),
    ).toBe(false);
  });

  it('denies read when unauthenticated and document is missing userAliasId', () => {
    expect(canReadSyncIngressEvent(null, { eventType: 'tx.v1' })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// /syncIngressEvents/{eventId} — writes
// ---------------------------------------------------------------------------

describe('Firestore rules — /syncIngressEvents/{eventId} writes', () => {
  it('always denies client writes regardless of auth', () => {
    expect(canWriteSyncIngressEvent()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// /transactions  /categories  /budgets  — projected collections
// ---------------------------------------------------------------------------

describe('Firestore rules — projected collections (transactions/categories/budgets)', () => {
  it('allows read when userAliasId field matches authenticated uid', () => {
    expect(canReadProjectedDoc({ uid: 'alice' }, { userAliasId: 'alice' })).toBe(true);
  });

  it('denies read when userAliasId field does not match uid', () => {
    expect(canReadProjectedDoc({ uid: 'alice' }, { userAliasId: 'bob' })).toBe(false);
  });

  it('denies read when unauthenticated', () => {
    expect(canReadProjectedDoc(null, { userAliasId: 'alice' })).toBe(false);
  });

  it('always denies client writes', () => {
    expect(canWriteProjectedDoc()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// /aiMetrics/{userAliasId}
// ---------------------------------------------------------------------------

describe('Firestore rules — /aiMetrics/{userAliasId}', () => {
  it('allows read when authenticated user owns the metrics doc', () => {
    expect(canReadAiMetrics({ uid: 'alice' }, 'alice')).toBe(true);
  });

  it('denies read when uid does not match alias', () => {
    expect(canReadAiMetrics({ uid: 'alice' }, 'bob')).toBe(false);
  });

  it('denies read when unauthenticated', () => {
    expect(canReadAiMetrics(null, 'alice')).toBe(false);
  });

  it('always denies client writes', () => {
    expect(canWriteAiMetrics()).toBe(false);
  });
});
