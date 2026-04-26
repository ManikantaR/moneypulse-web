# Phase 1 Spec - Auth and Tenant Boundary

## Goals

- Implement Firebase Auth for single-household usage.
- Enforce strict user-alias data isolation in Firestore rules.

## Deliverables

1. Auth pages: login, register, reset password.
2. Session bootstrap with user alias profile document.
3. Firestore rules for user-scoped reads and writes.
4. App Check verification on protected endpoints.

## Security Requirements

1. No anonymous auth in production.
2. Password policy enabled.
3. Optional MFA flow enabled behind feature flag.
4. Access denied if alias profile missing.

## Firestore Rules — Data Isolation Contract

| Collection | Client read | Client write | Write authority |
| --- | --- | --- | --- |
| `/users/{userAliasId}` | Own UID only | Own UID only | Client / Admin SDK |
| `/users/{userAliasId}/{document=**}` | Own UID only | Own UID only | Client / Admin SDK |
| `syncIngressEvents/{eventId}` | Own UID only (field existence check) | Never | Cloud Functions Admin SDK only |

**`syncIngressEvents` read rule:**

```firestore-rules
allow read: if request.auth != null
            && ('userAliasId' in resource.data)
            && resource.data.userAliasId == request.auth.uid;
allow write: if false;
```

The `'userAliasId' in resource.data` existence check is required so documents with a missing or null field fail closed rather than relying on `null == uid` falsy evaluation.

Admin SDK (Cloud Functions) bypasses all Firestore client rules; ingestion correctness is enforced by HMAC signature verification in the function handler, not in rules.
