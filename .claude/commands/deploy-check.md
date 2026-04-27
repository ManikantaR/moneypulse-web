Check Firebase deploy readiness for MoneyPulse Web before deploying or changing deploy config.

**GCP APIs — all must be enabled:**
- Firestore Rules API
- Cloud Functions API
- Cloud Build API
- Artifact Registry API
- Firebase Extensions API
- Secret Manager API
- Cloud Run API
- Eventarc API
- Cloud Billing API

Verify: GCP Console → APIs and Services → Enabled APIs.

**Secret Manager:**
- `SYNC_SIGNING_SECRET` must exist and have the correct value
- Deploy SA must have `roles/secretmanager.viewer` at project level
- Compute SA must have `Secret Manager Secret Accessor` on the specific secret

Verify: GCP Console → Secret Manager → SYNC_SIGNING_SECRET → Permissions tab.

**GitHub Secrets:**
- `FIREBASE_PROJECT_ID` — must be the project **ID string** (e.g., `moneypulse-abc`), not the numeric project number
- `GCP_WORKLOAD_IDENTITY_PROVIDER` — Workload Identity Pool provider resource name
- `GCP_SERVICE_ACCOUNT_EMAIL` — deploy service account email

Verify: GitHub repo Settings → Secrets and variables → Actions.

**firebase.json:**
- `runtime: nodejs22` in functions config
- deploy targets: `firestore,functions,hosting`
- Functions region: `us-east4`

**Before any deploy workflow change:**
- Confirm the manual prerequisites above
- State the exact rerun step: push to `main` or manually trigger the Actions workflow
- Do not assume the deploy can self-heal — missing APIs or IAM cause cryptic errors

**Post-deploy verification:**
1. `ingestSyncEvent` URL responds to GET with 405 (method not allowed, not 404)
2. `health` endpoint returns `{ ok: true }`
3. Firestore rules deploy log shows no compilation errors
4. Hosting deploy shows the web app URL
