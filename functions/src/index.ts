import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import {
  hashSyncPayload,
  verifySyncSignature,
  type SyncRequestHeaders,
} from './sync/security.js';

const syncSigningSecret = defineSecret('SYNC_SIGNING_SECRET');

function getDb() {
  if (!getApps().length) {
    initializeApp();
  }

  return getFirestore();
}

function getHeaderValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function extractSyncHeaders(headers: Record<string, string | string[] | undefined>): SyncRequestHeaders | null {
  const signature = getHeaderValue(headers['x-mp-signature']);
  const keyId = getHeaderValue(headers['x-mp-key-id']);
  const timestamp = getHeaderValue(headers['x-mp-timestamp']);
  const idempotencyKey = getHeaderValue(headers['x-mp-idempotency-key']);

  if (!signature || !keyId || !timestamp || !idempotencyKey) {
    return null;
  }

  return {
    signature,
    keyId,
    timestamp,
    idempotencyKey,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAlreadyExistsError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return 'code' in error
    ? (error as { code?: unknown }).code === 6
    : error.message.toLowerCase().includes('already exists');
}

async function fanOutTransaction(
  db: ReturnType<typeof getFirestore>,
  body: Record<string, unknown>,
): Promise<void> {
  const txnAliasId = typeof body.transactionAliasId === 'string' ? body.transactionAliasId : null;
  const userAliasId = typeof body.userAliasId === 'string' ? body.userAliasId : null;

  if (!txnAliasId || !userAliasId) return;

  await db.collection('transactions').doc(txnAliasId).set({
    transactionAliasId: txnAliasId,
    accountAliasId: typeof body.accountAliasId === 'string' ? body.accountAliasId : null,
    amountCents: typeof body.amountCents === 'number' ? body.amountCents : 0,
    date: typeof body.date === 'string' ? body.date.slice(0, 10) : null,
    categoryId: typeof body.categoryId === 'string' ? body.categoryId : null,
    isCredit: body.isCredit === true,
    isManual: body.isManual === true,
    userAliasId,
    syncedAt: FieldValue.serverTimestamp(),
  });
}

export const health = onRequest((req, res) => {
  res.status(200).json({ ok: true, service: 'moneypulse-web-functions' });
});

export const ingestSyncEvent = onRequest(
  {
    region: 'us-east4',
    secrets: [syncSigningSecret],
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
      return;
    }

    if (!isRecord(req.body)) {
      res.status(400).json({ ok: false, code: 'INVALID_BODY' });
      return;
    }

    const headers = extractSyncHeaders(req.headers);
    if (!headers) {
      res.status(400).json({ ok: false, code: 'MISSING_HEADERS' });
      return;
    }

    const secret = syncSigningSecret.value();
    const verified = verifySyncSignature({
      payload: req.body,
      headers,
      secret,
    });

    if (!verified.valid) {
      const status = verified.reason === 'INVALID_SIGNATURE' ? 401 : 400;
      res.status(status).json({ ok: false, code: verified.reason });
      return;
    }

    const db = getDb();
    const payloadHash = hashSyncPayload(req.body);
    const docRef = db.collection('syncIngressEvents').doc(headers.idempotencyKey);

    try {
      await docRef.create({
        idempotencyKey: headers.idempotencyKey,
        keyId: headers.keyId,
        requestTimestamp: headers.timestamp,
        payloadHash,
        userAliasId:
          typeof req.body.userAliasId === 'string' ? req.body.userAliasId : null,
        eventType:
          typeof req.body.eventType === 'string' ? req.body.eventType : null,
        payload: req.body,
        receivedAt: FieldValue.serverTimestamp(),
        status: 'accepted',
      });
    } catch (error: unknown) {
      if (isAlreadyExistsError(error)) {
        res.status(202).json({ ok: true, duplicate: true, payloadHash });
        return;
      }

      throw error;
    }

    // Fan-out: project transaction events into the queryable transactions collection.
    // Uses Firebase Admin SDK so Firestore rules are bypassed (server-side write).
    if (req.body.eventType === 'transaction.projected.v1') {
      await fanOutTransaction(db, req.body);
    }

    res.status(202).json({
      ok: true,
      duplicate: false,
      idempotencyKey: headers.idempotencyKey,
      payloadHash,
    });
  },
);
