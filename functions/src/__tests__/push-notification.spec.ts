/**
 * Unit tests for sendPushToUser.
 *
 * Tests cover:
 *   1. Calls sendEachForMulticast with the correct token list and notification.
 *   2. Prunes tokens flagged messaging/registration-token-not-registered.
 *   3. No-ops gracefully when the deviceTokens subcollection is empty.
 *   4. Data payload contains only type and notificationId — no PII.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendPushToUser } from '../notifications/push.js';
import type { Firestore } from 'firebase-admin/firestore';
import type { Messaging, MulticastMessage } from 'firebase-admin/messaging';

// ---------------------------------------------------------------------------
// Helpers — build Firestore and Messaging mocks
// ---------------------------------------------------------------------------

function makeTokenDoc(id: string, token: string) {
  return { id, data: () => ({ token }) };
}

function makeDb(
  tokenDocs: ReturnType<typeof makeTokenDoc>[],
  mockDelete: ReturnType<typeof vi.fn>,
): Firestore {
  const mockGet = vi.fn().mockResolvedValue({ empty: tokenDocs.length === 0, docs: tokenDocs });

  function makeDocRef(docId: string): unknown {
    return {
      id: docId,
      delete: mockDelete,
      collection: (_: string) => ({
        get: mockGet,
        doc: (id2: string) => makeDocRef(id2),
      }),
    };
  }

  return {
    collection: (_: string) => ({
      doc: (id: string) => makeDocRef(id),
    }),
  } as unknown as Firestore;
}

function makeMessaging(responses: Array<{ success: boolean; errorCode?: string }>) {
  const sendEachForMulticast = vi.fn().mockResolvedValue({
    responses: responses.map((r) => ({
      success: r.success,
      error: r.errorCode ? { code: r.errorCode } : undefined,
    })),
    successCount: responses.filter((r) => r.success).length,
    failureCount: responses.filter((r) => !r.success).length,
  });
  return { sendEachForMulticast } as unknown as Messaging & { sendEachForMulticast: ReturnType<typeof vi.fn> };
}

// ---------------------------------------------------------------------------
// Test cases
// ---------------------------------------------------------------------------

describe('sendPushToUser', () => {
  let mockDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDelete = vi.fn().mockResolvedValue(undefined);
  });

  it('calls sendEachForMulticast with correct tokens, title, and body', async () => {
    const tokens = [makeTokenDoc('tok1', 'fcm-token-a'), makeTokenDoc('tok2', 'fcm-token-b')];
    const db = makeDb(tokens, mockDelete);
    const messaging = makeMessaging([{ success: true }, { success: true }]);

    await sendPushToUser(db, messaging, 'user-alias-1', 'notif-alias-1', {
      title: 'Budget alert',
      body: 'You have exceeded your monthly budget.',
      type: 'budget_alert',
    });

    expect(messaging.sendEachForMulticast).toHaveBeenCalledOnce();
    const call = (messaging.sendEachForMulticast as ReturnType<typeof vi.fn>).mock.calls[0]![0] as MulticastMessage;
    expect(call.tokens).toEqual(['fcm-token-a', 'fcm-token-b']);
    expect(call.notification?.title).toBe('Budget alert');
    expect(call.notification?.body).toBe('You have exceeded your monthly budget.');
  });

  it('prunes a token that returns messaging/registration-token-not-registered', async () => {
    const tokens = [makeTokenDoc('tok1', 'fcm-token-a'), makeTokenDoc('tok2', 'fcm-token-b')];
    const db = makeDb(tokens, mockDelete);
    const messaging = makeMessaging([
      { success: true },
      { success: false, errorCode: 'messaging/registration-token-not-registered' },
    ]);

    await sendPushToUser(db, messaging, 'user-alias-1', 'notif-alias-1', {
      title: 'Alert',
      body: 'Test',
      type: 'alert',
    });

    // Only the second token (tok2) should be deleted
    expect(mockDelete).toHaveBeenCalledOnce();
  });

  it('does not delete tokens that fail for other reasons', async () => {
    const tokens = [makeTokenDoc('tok1', 'fcm-token-a')];
    const db = makeDb(tokens, mockDelete);
    const messaging = makeMessaging([{ success: false, errorCode: 'messaging/internal-error' }]);

    await sendPushToUser(db, messaging, 'user-alias-1', 'notif-alias-1', {
      title: 'Alert',
      body: 'Test',
      type: 'alert',
    });

    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('no-ops when the deviceTokens subcollection is empty', async () => {
    const db = makeDb([], mockDelete);
    const messaging = makeMessaging([]);

    await sendPushToUser(db, messaging, 'user-alias-1', 'notif-alias-1', {
      title: 'Alert',
      body: 'Body',
      type: 'alert',
    });

    expect(messaging.sendEachForMulticast).not.toHaveBeenCalled();
  });

  it('data payload contains only type and notificationId — no PII fields', async () => {
    const tokens = [makeTokenDoc('tok1', 'fcm-token-a')];
    const db = makeDb(tokens, mockDelete);
    const messaging = makeMessaging([{ success: true }]);

    await sendPushToUser(db, messaging, 'user-alias-1', 'notif-alias-99', {
      title: 'Spending anomaly',
      body: 'Unusual activity detected.',
      type: 'spending_anomaly',
    });

    const call = (messaging.sendEachForMulticast as ReturnType<typeof vi.fn>).mock.calls[0]![0] as MulticastMessage;
    const dataKeys = Object.keys(call.data ?? {});
    expect(dataKeys.sort()).toEqual(['notificationId', 'type']);
    expect(call.data?.notificationId).toBe('notif-alias-99');
    expect(call.data?.type).toBe('spending_anomaly');
  });
});
