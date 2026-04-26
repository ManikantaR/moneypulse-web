# Phase 0 Spec - Foundation and Security Baseline

## Goals

- Bootstrap independent Firebase repository and environment
- Enforce security defaults before feature delivery
- Prepare delivery pipeline for web + functions + rules

## Deliverables

1. Firebase project in us-east4
2. Hosting configured for Next.js deployment target
3. Firestore initialized with rules and indexes in source control
4. Functions project scaffold with TypeScript
5. App Check configured for web (reCAPTCHA Enterprise)
6. CI workflows for pull request validation and deploy

## Required Files

- firebase.json
- .firebaserc
- firestore.rules
- firestore.indexes.json
- functions/src/index.ts
- .github/workflows/ci.yml
- .github/workflows/deploy.yml

## Security Controls

1. Firestore rules default deny — every collection requires an explicit rule; the global `match /{document=**} { allow read, write: if false; }` block provides no collection-level coverage on its own.
2. User document isolation uses a two-level rule:
   - `match /users/{userAliasId}` — protects the root profile document (zero sub-segments; not covered by `{document=**}`).
   - `match /users/{userAliasId}/{document=**}` — protects all sub-collections.
   - Both gates check `request.auth.uid == userAliasId`.
3. Functions ingress requires:
   - HMAC signature header
   - Timestamp freshness window
   - Idempotency key
4. Secrets stored in Google Secret Manager or Firebase runtime config
5. App Check enforced in production after staging validation

## Exit Criteria

- CI passes lint, typecheck, test
- Firestore rules deploy from CLI successfully
- Hosting preview deploy works on pull requests
- Production deploy gated to main branch only
