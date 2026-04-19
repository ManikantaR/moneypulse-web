# Push Notifications Technical Decision

## Decision

Use Firebase Cloud Messaging (FCM) for browser push notifications.

## Why

1. Native integration with Firebase Auth and Functions.
2. Reliable web push delivery model via service worker.
3. Supports token-based targeting and scalable fanout.
4. Fits single-cloud operational model.

## Architecture

1. Browser registers FCM token after explicit user permission.
2. Token is stored in Firestore under user alias and device metadata.
3. Cloud Function sends notification to token set.
4. Service worker handles background message display.
5. App routes user to in-app notification center when opened.

## Browser Implementation Notes

1. Ask for permission after user action, not on initial page load.
2. Keep payload lightweight; fetch rich details from Firestore on open.
3. Handle token refresh and stale token cleanup.
4. Keep per-device token records to avoid duplicate sends.

## Security Controls

1. Token write requires authenticated user and self-owned alias path.
2. Function send endpoint requires admin role claim or internal trigger.
3. App Check enforced on token registration writes.
4. Notification payloads must exclude sensitive financial details.

## Delivery and Reliability

1. Retry failed sends with bounded backoff.
2. Remove tokens marked invalid by FCM response.
3. Store send events for traceability.
4. Track delivery success and failure metrics.
