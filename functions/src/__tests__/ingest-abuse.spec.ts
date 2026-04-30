/**
 * Ingress abuse tests — verifies all rejection paths in ingestSyncEvent.
 * These tests exercise: method guard, header validation, signature verification,
 * timestamp staleness, body shape, and idempotency replay.
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { computeSyncSignature } from '../sync/security.js';

// ── Shared mocks ──────────────────────────────────────────────────────────────

const mockCreate = vi.fn();
const mockSet = vi.fn();

// Recursive Firestore builder: collection().doc().collection().doc()...
function makeDocRef(): Record<string, unknown> {
  return {
    create: mockCreate,
    set: mockSet,
    collection: (name: string) => makeCollectionRef(name),
  };
}

function makeCollectionRef(_name: string) {
  return { doc: (_id: string) => makeDocRef() };
}

const mockDb = { collection: (_name: string) => makeCollectionRef(_name) };

vi.mock('firebase-admin/app', () => ({
  getApps: () => [{}],
  initializeApp: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => mockDb),
  FieldValue: { serverTimestamp: () => '__ts__' },
}));

vi.mock('firebase-functions/params', () => ({
  defineSecret: () => ({ value: () => 'test-secret-value' }),
}));

let capturedHandler: (req: unknown, res: unknown) => Promise<void>;

vi.mock('firebase-functions/v2/https', () => ({
  onRequest: (_opts: unknown, handler: typeof capturedHandler) => {
    capturedHandler = handler;
    return handler;
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const SECRET = 'test-secret-value';
const FRESH_TS = new Date(Date.now() - 30_000).toISOString(); // 30s ago — always fresh

function makeBody(eventType = 'transaction.projected.v1') {
  return {
    eventType,
    userAliasId: 'user-alias-1',
    transactionAliasId: 'txn-alias-1',
    accountAliasId: 'acct-alias-1',
    amountCents: 4200,
    isCredit: false,
    isManual: false,
    date: '2026-01-15',
  };
}

function makeHeaders(body: Record<string, unknown>, overrides: Record<string, string> = {}) {
  const timestamp = overrides['x-mp-timestamp'] ?? FRESH_TS;
  const idempotencyKey = overrides['x-mp-idempotency-key'] ?? 'idem-unique-001';
  const signature =
    overrides['x-mp-signature'] ??
    computeSyncSignature(body, timestamp, idempotencyKey, SECRET);
  return {
    'x-mp-signature': signature,
    'x-mp-key-id': overrides['x-mp-key-id'] ?? 'sync-key-v1',
    'x-mp-timestamp': timestamp,
    'x-mp-idempotency-key': idempotencyKey,
  };
}

interface MockRes {
  statusCode: number;
  body: unknown;
  status: (code: number) => MockRes;
  json: (data: unknown) => void;
}

function mockRes(): MockRes {
  const res = {
    statusCode: 0,
    body: null as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(data: unknown) {
      res.body = data;
    },
  };
  return res;
}

function mockReq(method: string, body: unknown, headers: Record<string, string> = {}) {
  return { method, body, headers };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ingestSyncEvent — abuse and rejection paths', () => {
  beforeAll(async () => {
    // Import after mocks are registered so onRequest captures the handler
    await import('../index.js');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue(undefined);
    mockSet.mockResolvedValue(undefined);
  });

  it('rejects non-POST requests with 405', async () => {
    const res = mockRes();
    await capturedHandler(mockReq('GET', {}, {}), res);
    expect(res.statusCode).toBe(405);
    expect((res.body as any).code).toBe('METHOD_NOT_ALLOWED');
  });

  it('rejects non-object body with 400', async () => {
    const body = makeBody();
    const res = mockRes();
    await capturedHandler(mockReq('POST', 'not-an-object', makeHeaders(body)), res);
    expect(res.statusCode).toBe(400);
    expect((res.body as any).code).toBe('INVALID_BODY');
  });

  it('rejects request with missing signature header with 400', async () => {
    const body = makeBody();
    const headers = makeHeaders(body);
    delete (headers as any)['x-mp-signature'];
    const res = mockRes();
    await capturedHandler(mockReq('POST', body, headers), res);
    expect(res.statusCode).toBe(400);
    expect((res.body as any).code).toBe('MISSING_HEADERS');
  });

  it('rejects request with missing idempotency key with 400', async () => {
    const body = makeBody();
    const headers = makeHeaders(body);
    delete (headers as any)['x-mp-idempotency-key'];
    const res = mockRes();
    await capturedHandler(mockReq('POST', body, headers), res);
    expect(res.statusCode).toBe(400);
    expect((res.body as any).code).toBe('MISSING_HEADERS');
  });

  it('rejects invalid signature with 401', async () => {
    const body = makeBody();
    const res = mockRes();
    await capturedHandler(
      mockReq('POST', body, makeHeaders(body, { 'x-mp-signature': '0'.repeat(64) })),
      res,
    );
    expect(res.statusCode).toBe(401);
    expect((res.body as any).code).toBe('INVALID_SIGNATURE');
  });

  it('rejects stale timestamp with 400', async () => {
    const body = makeBody();
    const staleTs = new Date(Date.now() - 10 * 60_000).toISOString(); // 10 min ago
    const sig = computeSyncSignature(body, staleTs, 'idem-stale', SECRET);
    const res = mockRes();
    await capturedHandler(
      mockReq('POST', body, {
        'x-mp-signature': sig,
        'x-mp-key-id': 'sync-key-v1',
        'x-mp-timestamp': staleTs,
        'x-mp-idempotency-key': 'idem-stale',
      }),
      res,
    );
    expect(res.statusCode).toBe(400);
    expect((res.body as any).code).toBe('TIMESTAMP_OUT_OF_RANGE');
  });

  it('returns 202 with duplicate:true for replay of existing idempotency key', async () => {
    const alreadyExists = new Error('Already exists');
    (alreadyExists as any).code = 6;
    mockCreate.mockRejectedValueOnce(alreadyExists);

    const body = makeBody();
    const res = mockRes();
    await capturedHandler(mockReq('POST', body, makeHeaders(body)), res);
    expect(res.statusCode).toBe(202);
    expect((res.body as any).duplicate).toBe(true);
  });

  it('accepts a valid signed request and returns 202 with duplicate:false', async () => {
    const body = makeBody();
    const res = mockRes();
    await capturedHandler(mockReq('POST', body, makeHeaders(body)), res);
    expect(res.statusCode).toBe(202);
    expect((res.body as any).duplicate).toBe(false);
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it('accepts a valid ai.metrics.projected.v1 event', async () => {
    const body = {
      eventType: 'ai.metrics.projected.v1',
      userAliasId: 'user-alias-1',
      totalRuns: 10,
      avgLatencyMs: 450,
      avgConfidence: 0.91,
      piiDetectionCount: 0,
      piiDetectionRate: 0,
      categoriesAssignedTotal: 55,
      model: 'gpt-4o',
      healthStatus: 'ok',
      generatedAt: new Date().toISOString(),
      windowDays: 30,
    };
    const res = mockRes();
    await capturedHandler(mockReq('POST', body, makeHeaders(body)), res);
    expect(res.statusCode).toBe(202);
    expect((res.body as any).ok).toBe(true);
  });

  it('accepts a valid notification.projected.v1 event', async () => {
    const body = {
      eventType: 'notification.projected.v1',
      userAliasId: 'user-alias-1',
      notificationAliasId: 'notif-alias-1',
      type: 'budget_alert',
      title: 'Over budget: Dining',
      body: 'Over budget: Dining',
      createdAt: new Date().toISOString(),
    };
    const res = mockRes();
    await capturedHandler(mockReq('POST', body, makeHeaders(body)), res);
    expect(res.statusCode).toBe(202);
  });
});
