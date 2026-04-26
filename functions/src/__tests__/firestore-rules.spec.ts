import { describe, expect, it } from 'vitest';
import {
  canReadWriteUserDoc,
  canReadWriteUserSubCollection,
  canReadSyncIngressEvent,
  canWriteSyncIngressEvent,
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
// /users/{userAliasId}/{document=**}
// ---------------------------------------------------------------------------

describe('Firestore rules — /users/{userAliasId}/{document=**}', () => {
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
