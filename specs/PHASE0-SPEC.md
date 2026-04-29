# Phase 0 Spec - Foundation and Security Baseline

> Status: ✅ Done. Repository scaffold, Firestore deploy assets, Functions ingress, GitHub Actions OIDC deploy pipeline, Secret Manager, and least-privilege IAM are all complete and deployed.

## Goals

- Bootstrap an independent Firebase repository and environment
- Enforce secure defaults before user-facing feature delivery
- Establish deploy, rules, secrets, and ingress patterns that future phases can reuse safely

## Decisions Summary

| Decision | Choice |
| --- | --- |
| Project region | `us-east4` |
| Hosting frontend | Next.js app in `apps/web` |
| Functions runtime | Node.js 22 |
| Secret storage | Secret Manager |
| Ingress security | HMAC signature + timestamp + idempotency key |
| Firestore posture | default deny, projected writes blocked from browser |

## Deliverables

1. Firebase Hosting configured for the web app
2. Firestore rules and indexes tracked in source control
3. Functions scaffold with TypeScript and v2 HTTPS handlers
4. CI workflow for PR validation
5. Deploy workflow authenticated by GitHub OIDC Workload Identity Federation
6. Secret Manager-backed `SYNC_SIGNING_SECRET`
7. Documented API, IAM, and secret prerequisites for production deploy

## File Inventory

| File | Purpose |
| --- | --- |
| `firebase.json` | deploy targets for Firestore, Functions, and Hosting |
| `.firebaserc` | Firebase project alias mapping |
| `firestore.rules` | current access policy scaffold |
| `firestore.indexes.json` | future query indexes |
| `functions/src/index.ts` | `health` and `ingestSyncEvent` handlers |
| `functions/src/sync/security.ts` | signature, freshness, and payload hashing logic |
| `functions/package.json` | functions runtime, build, and test commands |
| `.github/workflows/ci.yml` | PR validation pipeline |
| `.github/workflows/deploy.yml` | production deploy pipeline |

## Security Controls

### Firestore

- default deny as the base rule posture
- no browser writes to projected collections
- future overlay collections must be explicitly separated from projected collections

### Functions Ingress

- require HMAC signature header
- require timestamp freshness window
- require idempotency key
- reject malformed bodies before processing

### Secrets And IAM

- `SYNC_SIGNING_SECRET` must exist in Secret Manager
- deploy service account must read secret metadata and secret values
- GitHub deploy must use project ID string, not project number

## Manual Prerequisites

The deploy workflow cannot bootstrap these safely on its own. Document and verify them.

1. Enable Firestore Rules API
2. Enable Cloud Functions API
3. Enable Cloud Build API
4. Enable Artifact Registry API
5. Enable Firebase Extensions API
6. Enable Secret Manager API
7. Enable Cloud Run API
8. Enable Eventarc API
9. Enable Cloud Billing API
10. Create `SYNC_SIGNING_SECRET` in Secret Manager
11. Grant deploy SA `roles/secretmanager.viewer` at project level (to verify secret exists during deploy)
12. Grant compute SA `Secret Manager Secret Accessor` on the specific `SYNC_SIGNING_SECRET` secret (runtime access for Cloud Functions)
13. GitHub secret `FIREBASE_PROJECT_ID` must be the project ID string, not the numeric project number

## Validation

```bash
pnpm install
pnpm test
pnpm build
```

Manual deploy validation:

1. run GitHub Actions deploy on `main`
2. confirm Firestore rules compile
3. confirm functions analysis succeeds
4. confirm secret lookup succeeds
5. confirm Hosting deploy finishes

## Exit Criteria

- CI passes test and build
- Firestore rules deploy successfully
- Functions deploy no longer fails on missing runtime, APIs, or secret access
- Hosting deploy works on `main`
- Secret Manager-backed ingress is deployable end-to-end
