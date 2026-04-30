# Production Launch Checklist

Work through this list top-to-bottom before declaring the app production-ready.
Items marked **automated** are enforced by CI or pre-commit hooks.

## Infrastructure and Deploy

- [ ] All GCP APIs enabled (see deploy runbook)
- [ ] `SYNC_SIGNING_SECRET` created in Secret Manager
- [ ] Compute SA has `secretmanager.secretAccessor` on the secret
- [ ] Deploy SA is least-privilege: only deploy and viewer roles
- [ ] GitHub Actions deploy workflow runs successfully end-to-end
- [ ] `FIREBASE_PROJECT_ID` GitHub secret is the string ID, not numeric
- [ ] Firebase Hosting serving the Next.js app at the expected domain
- [ ] `ingestSyncEvent` Cloud Function health check returns 200

## Security

- [ ] Firebase Auth: anonymous auth disabled (**verify in Firebase Console → Authentication → Sign-in providers**)
- [ ] Firestore default deny rule in place — verify `match /{document=**} { allow read, write: if false; }`
- [ ] No projected collection allows browser writes (transactions, categories, budgets, aiMetrics)
- [ ] Device tokens are scoped to the authenticated user alias only
- [ ] Notification `isRead`-only update rule enforced (no other field mutations from browser)
- [ ] HMAC signing enforced on all ingress: invalid signature → 401, stale → 400 **automated (CI tests)**
- [ ] No secrets in committed code or `.env` files checked into git
- [ ] `NEXT_PUBLIC_FIREBASE_VAPID_KEY` set for FCM push — key must match the project's web push certificate

## Data Boundary

- [ ] No PII (account numbers, real institution names) in any Firestore collection
- [ ] Notification body field in `notification.projected.v1` contains no dollar amounts
- [ ] AI metrics payload contains only aggregate counts, no raw prompt text
- [ ] `sanitizeMerchantName` applied to all transaction projections

## Tests and Build **automated**

- [ ] `pnpm test` — all tests passing
- [ ] `pnpm build` — TypeScript clean, no build errors
- [ ] `node scripts/validate-ai-customizations.mjs` — agent/skill/prompt structure valid
- [ ] `markdownlint-cli2` — no lint errors in docs and spec files

## Abuse Resistance

- [ ] Ingress abuse tests passing: method guard, missing headers, invalid sig, stale timestamp, replay **automated (CI tests)**
- [ ] Firestore rules manually verified with Firebase emulator or rules playground:
  - Unauthenticated read denied for all collections
  - Cross-user read denied (user A cannot read user B's data)
  - Browser write denied for projected collections

## Operations Readiness

- [ ] Deploy runbook written and reviewed — `docs/operations/runbook-deploy.md`
- [ ] Secret rotation runbook written — `docs/operations/runbook-secret-rotation.md`
- [ ] Incident response runbook written — `docs/operations/runbook-incident-response.md`
- [ ] Secret rotation dry run completed (or scheduled)
- [ ] Cloud Logging filters documented for: `INVALID_SIGNATURE`, `TIMESTAMP_OUT_OF_RANGE`, function errors

## Functional Smoke Test

Run this after every production deploy:

1. Sign in with a test account
2. Verify dashboard shows sync freshness indicator
3. Verify transactions list loads
4. Verify categories and budgets load
5. Open AI Insights — metrics or "no activity" message visible (no error)
6. Open Notifications — inbox renders (empty state or notifications)
7. Open Cloud Sync — trigger a backfill, verify response
8. Sign out, verify redirect to login

## Sign-off

| Check | Verified by | Date |
| --- | --- | --- |
| All checklist items above | | |
| Secret rotation drill completed | | |
| Smoke test passed | | |
