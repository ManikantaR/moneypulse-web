# Phase 5 Spec - In-App Notifications and Web Push

## Goals

- Implement in-app notifications and browser push delivery.

## Deliverables

1. Notification inbox page.
2. FCM token registration and rotation handling.
3. Service worker message handlers.
4. Delivery preference toggles per alert type.

## Web Push Technical Notes

1. Use Firebase Cloud Messaging for push transport.
2. Store tokens per device with lastSeen and user agent hash.
3. Revoke invalid tokens on send failures.
4. Keep push payload minimal and fetch full detail in-app.
