# Phase 1 Spec - Auth and Tenant Boundary

> Status: Planned. No auth UI or alias profile flow exists yet. This phase establishes user identity, alias-based isolation, and the first browser-authenticated experience.

## Goals

- Implement Firebase Auth for single-household usage
- Bootstrap a user alias profile document after sign-in
- Enforce strict user-alias data isolation in Firestore rules

## Decisions Summary

| Decision | Choice |
| --- | --- |
| Auth provider | Email/password first |
| Anonymous auth | Disabled in production |
| MFA | Feature-flagged, optional foundation only |
| User boundary | One authenticated user maps to one alias profile |
| Missing profile behavior | Deny access until bootstrap completes |

## Deliverables

1. Login page
2. Registration page
3. Password reset page
4. Session bootstrap with alias profile document
5. Auth-aware route shell in the web app
6. Firestore rules for user-scoped profile and overlay access

## File Inventory

| File Area | Purpose |
| --- | --- |
| `apps/web/src/app` | auth routes and protected shell |
| `apps/web/src/lib/firebase.ts` | auth client initialization |
| `firestore.rules` | profile and overlay access policy |
| future `apps/web/src/lib/auth/*` | auth hooks, session bootstrap, profile loading |
| future `apps/web/src/components/auth/*` | login/register/reset UI primitives |

## Data And Rules Model

### User Profile

Phase 1 introduces a cloud alias profile document keyed by the authenticated boundary the browser understands.

Suggested document responsibilities:

- authenticated user bootstrap status
- household alias identifier
- UI preferences safe to store in cloud
- timestamp metadata such as `createdAt`, `lastSeenAt`, `lastSyncAt`

### Rules Expectations

- unauthenticated users read nothing
- authenticated users may read and write only their own profile and future overlay state
- projected collections remain browser read-only
- missing auth context or missing alias mapping denies access

## Security Requirements

1. No anonymous auth in production
2. Password policy enabled
3. Optional MFA flow hidden behind feature flag
4. Access denied if alias profile missing or bootstrap incomplete
5. App Check scope documented for future protected browser calls

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

## Validation

- register with valid email/password
- login and observe profile bootstrap
- sign out and confirm protected routes redirect correctly
- verify Firestore rules deny unauthenticated access
- verify one user cannot access another user's profile document

## Exit Criteria

- auth pages exist and render correctly
- profile bootstrap creates or fetches the alias profile document
- protected routes deny access without login
- Firestore rules enforce per-user profile isolation
- future overlay collections have a clear rule pattern to reuse
