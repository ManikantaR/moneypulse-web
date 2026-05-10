# Incident Response Runbook

## Severity Levels

| Level | Criteria | Response time |
| --- | --- | --- |
| P1 | Data boundary breach — PII in cloud | Immediate |
| P2 | Auth broken — users cannot sign in | < 30 min |
| P2 | Sync stopped — all events rejected | < 30 min |
| P3 | Stale data — sync delayed > 24h | < 4h |
| P4 | Single metric card missing/incorrect | Next deploy |

## Runbook: Sync Stopped (P2)

**Symptoms:** No new `syncIngressEvents` docs in Firestore; local MoneyPulse shows delivery failures.

**Diagnostic steps:**

```bash
# 1. Check function health
curl https://ingestsyncevent-<hash>-ue.a.run.app/../health

# 2. Check Cloud Logging for errors
# GCP Console → Logging → filter: resource.type="cloud_run_revision" AND severity>=ERROR

# 3. Verify secret is accessible
gcloud secrets versions access latest --secret=SYNC_SIGNING_SECRET
```

**Common causes:**

- Secret Manager secret deleted or all versions disabled → restore secret (see rotation runbook)
- Cloud Run service cold start failing → check Cloud Logging for startup error
- OIDC or IAM permission revoked → re-grant `secretmanager.secretAccessor` to compute SA

**Resolution:** Restore access or redeploy. Missing events during the outage will be re-delivered by the local outbox retry mechanism (BullMQ) once the endpoint recovers.

## Runbook: Auth Broken (P2)

**Symptoms:** Users see login error; Firebase Auth calls fail.

**Diagnostic steps:**

1. Check Firebase Console → Authentication → usage graph for error spike
2. Check that `NEXT_PUBLIC_FIREBASE_API_KEY` and `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` are set correctly in the deployed Hosting version
3. Verify Firebase Auth is not disabled in the Firebase Console

**Resolution:** Redeploy with correct env vars, or re-enable Auth in Firebase Console.

## Runbook: Data Boundary Breach (P1)

**Symptoms:** PII (account numbers, real institution names, raw amounts linked to accounts) found in Firestore projected collections.

**Immediate actions:**

1. Disable the `ingestSyncEvent` function to stop further ingestion:

   ```bash
   # Set max-instances to 0 to drain without deleting
   gcloud run services update ingestsyncevent --max-instances=0 --region=us-east4
   ```

2. Identify the offending event type and payload field.
3. Delete the affected Firestore documents using the Firebase Console or Admin SDK.
4. Fix the sanitization bug in the local MoneyPulse sync payload builder.
5. Re-enable the function after fix is deployed.
6. Review sync logs for how many events were affected and who was impacted.

## Runbook: Stale Sync (P3)

**Symptoms:** Cloud Sync page shows last sync > 24h ago.

**Check list:**

- Is local MoneyPulse API running? (`http://localhost:3000/health`)
- Is the outbox worker running? (NestJS logs for BullMQ processor)
- Is the Cloud Function returning non-200? (see sync stopped runbook above)
- Is the signing secret mismatch? (check for `401 INVALID_SIGNATURE` in Cloud Logging)

**Resolution:** Usually restarting the local MoneyPulse API resolves delivery retries from the outbox.

## Rollback to Previous Deploy

```bash
# Hosting
firebase hosting:rollback

# Functions — redeploy from previous sha
git checkout <sha>
firebase deploy --only functions

# Firestore rules — redeploy previous rules
git checkout <sha> firestore.rules
firebase deploy --only firestore:rules
```

## Escalation Contacts

| Role | Contact method |
| --- | --- |
| App owner | direct message |
| GCP console access | project IAM — owner role |
