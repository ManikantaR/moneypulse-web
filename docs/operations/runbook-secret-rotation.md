# Secret Rotation Runbook

## SYNC_SIGNING_SECRET Rotation

The `SYNC_SIGNING_SECRET` is used to HMAC-sign sync events from the local MoneyPulse app before they reach the `ingestSyncEvent` Cloud Function. Rotating it requires coordinated update in both systems.

### When to Rotate

- Suspected compromise of the secret value
- Scheduled quarterly rotation policy
- Team member departure with access to the secret
- GCP project ownership transfer

### Rotation Steps

**Step 1 — Generate a new secret value**

```bash
openssl rand -hex 32
# e.g. a3f8c2...
```

**Step 2 — Create new secret version in GCP Secret Manager**

```bash
# In GCP Console → Secret Manager → SYNC_SIGNING_SECRET → Add version
# Paste new value. Keep previous version active temporarily for in-flight requests.
```

Or via CLI:

```bash
echo -n "<new-value>" | gcloud secrets versions add SYNC_SIGNING_SECRET --data-file=-
```

**Step 3 — Update local MoneyPulse app**

In the local MoneyPulse app, update the sync signing secret in its config (Settings → Cloud Sync → Signing Secret). The local app will begin signing with the new key.

**Step 4 — Deploy updated functions (pick up new secret version)**

```bash
# Functions read the latest active version at cold start.
# Re-deploy or force a cold start to pick up the new version:
firebase deploy --only functions
```

**Step 5 — Disable old secret version**

Once the local app is confirmed signing with the new key and new events are being accepted:

```bash
gcloud secrets versions disable <old-version-number> --secret=SYNC_SIGNING_SECRET
```

**Step 6 — Verify**

Check Cloud Logging for `ingestSyncEvent` — confirm recent events are returning `202 ok: true`.
Any `401 INVALID_SIGNATURE` after the rotation window indicates the local app still uses the old key.

### Dry Run / Drill Checklist

Use this to rehearse rotation without actually rotating:

- [ ] Locate current secret version number in GCP Secret Manager
- [ ] Confirm you can create a new version (permissions check)
- [ ] Identify where local MoneyPulse reads its signing secret (config file or env var)
- [ ] Confirm you can trigger a test sync event and see it accepted in Cloud Logging
- [ ] Confirm `ingestSyncEvent` health check responds
- [ ] Document time required for full rotation end-to-end (target: under 15 min)

### Rollback

If new-key events are rejected (function has not picked up new version yet), disable the new version and re-enable the old one:

```bash
gcloud secrets versions enable <old-version-number> --secret=SYNC_SIGNING_SECRET
gcloud secrets versions disable <new-version-number> --secret=SYNC_SIGNING_SECRET
```
