# Phase 5 Spec - In-App Notifications and Web Push

> Status: Planned. This phase adds cloud-native delivery surfaces on top of the projected alerts model while keeping payloads minimal and device state explicit.

## Goals

- Implement in-app notifications and browser push delivery
- Track device registration safely
- Keep push payloads minimal and fetch full detail in-app

## Decisions Summary

| Decision | Choice |
| --- | --- |
| Push transport | Firebase Cloud Messaging |
| Token scope | per device |
| Invalid token behavior | revoke on repeated send failure |
| Push payload size | minimal envelope only |
| Detail retrieval | fetch full notification in-app |

## Deliverables

1. Notification inbox page
2. FCM token registration and rotation handling
3. Service worker message handlers
4. Delivery preference toggles per alert type

## File Inventory

| File Area | Purpose |
| --- | --- |
| future `apps/web/src/app/(dashboard)/notifications/page.tsx` | inbox route |
| future `apps/web/src/lib/fcm/*` | browser FCM registration and permission flow |
| future `apps/web/public/firebase-messaging-sw.js` | service worker |
| future `functions/src/notifications/*` | push senders and token lifecycle helpers |
| `firestore.rules` | device token and preference access policy |

## Web Push Technical Notes

1. Use Firebase Cloud Messaging for push transport
2. Store tokens per device with `lastSeen` and user agent hash or equivalent safe metadata
3. Revoke invalid tokens on send failures
4. Keep push payload minimal and fetch full detail in-app

## Security Requirements

- tokens must be scoped to the authenticated alias boundary
- token metadata must not expose direct device identity beyond what is required operationally
- push payloads must not contain sensitive financial details in notification bodies

## Validation

- verify token registration from a supported browser
- verify token rotation updates stored device state
- verify invalid token handling removes or disables bad tokens
- verify inbox detail fetch works even when push payload is minimal

## Exit Criteria

- inbox page renders notification state clearly
- token registration and rotation work reliably
- push delivery path can be exercised in staging or local-supported environments
- notification payloads remain minimal and privacy-safe
