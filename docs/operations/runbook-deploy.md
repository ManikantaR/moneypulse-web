# Deploy Runbook

## Normal Deploy Path

Deploys are triggered automatically via GitHub Actions on push to `main`.

```text
git push origin main
→ GitHub Actions: firebase-deploy.yml
→ Authenticates via OIDC Workload Identity Federation (no long-lived key)
→ firebase deploy --only hosting,functions,firestore:rules
```

## Required Secrets and Environment Variables

| Name | Where stored | Used by |
| --- | --- | --- |
| `FIREBASE_PROJECT_ID` | GitHub repo secret | deploy workflow |
| `SYNC_SIGNING_SECRET` | GCP Secret Manager | `ingestSyncEvent` function at runtime |
| `NEXT_PUBLIC_FIREBASE_*` | `.env.production` or Hosting env | Next.js build |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | `.env.production` | FCM web push |

Never commit `.env.production` to git. Inject via CI environment or Firebase Hosting config.

## GCP Prerequisites Checklist

Before first deploy succeeds, verify in GCP Console:

- [ ] Firestore Rules API enabled
- [ ] Cloud Functions API enabled
- [ ] Cloud Build API enabled
- [ ] Artifact Registry API enabled
- [ ] Firebase Extensions API enabled
- [ ] Secret Manager API enabled
- [ ] Cloud Run API enabled
- [ ] Eventarc API enabled
- [ ] Cloud Billing API enabled
- [ ] `SYNC_SIGNING_SECRET` created in Secret Manager
- [ ] Deploy SA has `roles/secretmanager.viewer` at project level
- [ ] Compute SA has `Secret Manager Secret Accessor` on the specific secret
- [ ] `FIREBASE_PROJECT_ID` GitHub secret set to project ID string (not number)

## Common Deploy Failures

### Functions deploy fails: "Secret not found"

```text
Error: Secret SYNC_SIGNING_SECRET not found or accessor permission denied
```

Fix: verify `SYNC_SIGNING_SECRET` exists in Secret Manager and compute SA has `secretmanager.secretAccessor` on that secret specifically.

### Functions deploy fails: "API not enabled"

```text
Error: Cloud Functions API has not been used in project X
```

Fix: enable the API in GCP Console → APIs and wait 2-3 min for propagation. Re-trigger the workflow.

### Hosting deploy fails: "Project not found"

```text
Error: Project moneypulse-xxx not found
```

Fix: `FIREBASE_PROJECT_ID` secret value must be the project ID string, not the project number. Verify in Firebase Console → Project Settings.

### OIDC auth fails: "Token exchange failed"

Fix: verify Workload Identity Federation pool is configured and the deploy SA is bound to the GitHub OIDC provider with the correct repo subject.

## Rollback Procedure

Firebase Hosting keeps previous deploy versions.

```bash
# List recent releases
firebase hosting:releases:list

# Roll back to previous version
firebase hosting:rollback
```

For Functions rollback, redeploy from the previous git commit:

```bash
git checkout <previous-sha>
firebase deploy --only functions
```

## Verifying a Successful Deploy

```bash
# Health check
curl https://ingestsyncevent-<hash>-ue.a.run.app/../health

# Expected
{"ok":true,"service":"moneypulse-web-functions"}
```

Check Firebase Console → Hosting → verify new release timestamp matches deploy.
