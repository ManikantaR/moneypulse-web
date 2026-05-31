/**
 * FCM push delivery helper.
 *
 * Reads device tokens from users/{userAliasId}/deviceTokens, sends a
 * multicast push, and prunes any token that Firebase reports as
 * no longer registered.
 *
 * All Firestore and Messaging references are injected so this module
 * is unit-testable without module mocks.
 *
 * Data-boundary contract: the `data` field sent to FCM contains only
 * alias-safe fields (type, notificationId). No financial amounts,
 * merchant names, or account numbers are included.
 */
import type { Firestore } from 'firebase-admin/firestore';
import type { Messaging } from 'firebase-admin/messaging';

export interface NotificationPayload {
  title: string;
  body: string;
  type: string;
}

const DEAD_TOKEN_CODE = 'messaging/registration-token-not-registered';

export async function sendPushToUser(
  db: Firestore,
  messaging: Messaging,
  userAliasId: string,
  notificationId: string,
  payload: NotificationPayload,
): Promise<void> {
  const tokenSnap = await db
    .collection('users')
    .doc(userAliasId)
    .collection('deviceTokens')
    .get();

  if (tokenSnap.empty) return;

  const tokens: string[] = [];
  const tokenDocIds: string[] = [];

  for (const docSnap of tokenSnap.docs) {
    const token = docSnap.data().token;
    if (typeof token === 'string' && token) {
      tokens.push(token);
      tokenDocIds.push(docSnap.id);
    }
  }

  if (tokens.length === 0) return;

  const batchResponse = await messaging.sendEachForMulticast({
    tokens,
    notification: { title: payload.title, body: payload.body },
    webpush: {
      fcmOptions: { link: '/notifications' },
      notification: { icon: '/icons/icon-192.png' },
    },
    data: {
      type: payload.type,
      notificationId,
    },
  });

  // Prune tokens Firebase has flagged as unregistered.
  const prunePromises: Promise<void>[] = [];
  batchResponse.responses.forEach((resp, i) => {
    const docId = tokenDocIds[i];
    if (!resp.success && resp.error?.code === DEAD_TOKEN_CODE && docId !== undefined) {
      prunePromises.push(
        db
          .collection('users')
          .doc(userAliasId)
          .collection('deviceTokens')
          .doc(docId)
          .delete()
          .then(() => undefined),
      );
    }
  });

  await Promise.all(prunePromises);
}
