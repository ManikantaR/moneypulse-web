import { describe, expect, it } from 'vitest';
import {
  canonicalizeSyncPayload,
  computeSyncSignature,
  hashSyncPayload,
  verifySyncSignature,
} from '../sync/security.js';

describe('sync security utilities', () => {
  it('canonicalizes payloads deterministically', () => {
    const left = canonicalizeSyncPayload({
      b: 2,
      nested: { y: 2, x: 1 },
      a: 1,
    });
    const right = canonicalizeSyncPayload({
      a: 1,
      nested: { x: 1, y: 2 },
      b: 2,
    });

    expect(left).toBe(right);
    expect(hashSyncPayload({ a: 1, nested: { x: 1, y: 2 }, b: 2 })).toHaveLength(64);
  });

  it('verifies a valid sync signature', () => {
    const payload = { eventType: 'transaction.projected.v1', amountCents: 4200 };
    const timestamp = '2026-04-19T19:30:00.000Z';
    const idempotencyKey = 'idem-123';
    const secret = 'sync-secret-test';
    const signature = computeSyncSignature(payload, timestamp, idempotencyKey, secret);

    const result = verifySyncSignature({
      payload,
      headers: {
        signature,
        keyId: 'sync-key-v1',
        timestamp,
        idempotencyKey,
      },
      secret,
      now: new Date('2026-04-19T19:31:00.000Z'),
    });

    expect(result).toEqual({ valid: true });
  });

  it('rejects an invalid signature', () => {
    const result = verifySyncSignature({
      payload: { eventType: 'transaction.projected.v1', amountCents: 4200 },
      headers: {
        signature: '0'.repeat(64),
        keyId: 'sync-key-v1',
        timestamp: '2026-04-19T19:30:00.000Z',
        idempotencyKey: 'idem-123',
      },
      secret: 'sync-secret-test',
      now: new Date('2026-04-19T19:31:00.000Z'),
    });

    expect(result).toEqual({ valid: false, reason: 'INVALID_SIGNATURE' });
  });

  it('rejects a stale timestamp', () => {
    const payload = { eventType: 'transaction.projected.v1', amountCents: 4200 };
    const timestamp = '2026-04-19T19:00:00.000Z';
    const idempotencyKey = 'idem-123';
    const secret = 'sync-secret-test';
    const signature = computeSyncSignature(payload, timestamp, idempotencyKey, secret);

    const result = verifySyncSignature({
      payload,
      headers: {
        signature,
        keyId: 'sync-key-v1',
        timestamp,
        idempotencyKey,
      },
      secret,
      now: new Date('2026-04-19T19:10:01.000Z'),
      maxSkewMs: 5 * 60 * 1000,
    });

    expect(result).toEqual({ valid: false, reason: 'TIMESTAMP_OUT_OF_RANGE' });
  });
});