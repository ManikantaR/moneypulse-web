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

1. Firestore rules default deny
2. Enforced auth-based document access by alias user id
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
