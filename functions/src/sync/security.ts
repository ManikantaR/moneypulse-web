import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export interface SyncRequestHeaders {
  signature: string;
  keyId: string;
  timestamp: string;
  idempotencyKey: string;
}

export interface VerifySyncSignatureInput {
  payload: Record<string, unknown>;
  headers: SyncRequestHeaders;
  secret: string;
  now?: Date;
  maxSkewMs?: number;
}

function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));

    return Object.fromEntries(
      entries.map(([key, entryValue]) => [key, normalizeValue(entryValue)]),
    );
  }

  return value;
}

export function canonicalizeSyncPayload(
  payload: Record<string, unknown>,
): string {
  return JSON.stringify(normalizeValue(payload));
}

export function hashSyncPayload(payload: Record<string, unknown>): string {
  return createHash('sha256')
    .update(canonicalizeSyncPayload(payload))
    .digest('hex');
}

export function computeSyncSignature(
  payload: Record<string, unknown>,
  timestamp: string,
  idempotencyKey: string,
  secret: string,
): string {
  const canonical = canonicalizeSyncPayload(payload);
  const toSign = `${timestamp}\n${idempotencyKey}\n${canonical}`;
  return createHmac('sha256', secret).update(toSign).digest('hex');
}

export function verifySyncSignature({
  payload,
  headers,
  secret,
  now = new Date(),
  maxSkewMs = 5 * 60 * 1000,
}: VerifySyncSignatureInput): { valid: true } | { valid: false; reason: string } {
  const parsedTimestamp = new Date(headers.timestamp);
  if (Number.isNaN(parsedTimestamp.getTime())) {
    return { valid: false, reason: 'INVALID_TIMESTAMP' };
  }

  const skewMs = Math.abs(now.getTime() - parsedTimestamp.getTime());
  if (skewMs > maxSkewMs) {
    return { valid: false, reason: 'TIMESTAMP_OUT_OF_RANGE' };
  }

  const expected = computeSyncSignature(
    payload,
    headers.timestamp,
    headers.idempotencyKey,
    secret,
  );

  const expectedBuffer = Buffer.from(expected, 'hex');
  const actualBuffer = Buffer.from(headers.signature, 'hex');
  if (expectedBuffer.length !== actualBuffer.length) {
    return { valid: false, reason: 'INVALID_SIGNATURE' };
  }

  if (!timingSafeEqual(expectedBuffer, actualBuffer)) {
    return { valid: false, reason: 'INVALID_SIGNATURE' };
  }

  return { valid: true };
}