Test and validate the end-to-end sync pipeline from local MoneyPulse to Firebase.

This command walks through verifying the full pipeline: MyMoney outbox → signing → delivery → Firebase ingestSyncEvent → Firestore.

**Step 1 — Confirm Firebase Functions URL**

Find the `ingestSyncEvent` URL:
```
Firebase Console → Build → Functions → ingestSyncEvent row → copy Trigger URL
```
Format: `https://ingestsyncevent-[hash]-ue.a.run.app`

**Step 2 — Confirm MyMoney env vars are set**

Required in `../MyMoney/.env`:
- `SYNC_SIGNING_SECRET` — must match the value in Firebase Secret Manager
- `ALIAS_SECRET` — for deterministic alias mapping
- `FIREBASE_SYNC_ENDPOINT` — the URL from Step 1
- `SYNC_SIGNING_KEY_ID` — default `sync-key-v1`

**Step 3 — Send a test event manually**

Use the signing utility to generate a test payload and send it:
```bash
cd ../MyMoney
# Check if a manual test script exists
ls apps/api/src/sync/__tests__/
```

If no test script exists, create a minimal one-off:
```typescript
// Generates a signed payload and POSTs to Firebase
const payload = { eventType: 'transaction.projected.v1', userAliasId: 'a1_test', amountCents: 4200 };
// Use SigningService to produce headers
// POST to SYNC_FIREBASE_INGESTION_URL with x-mp-* headers
```

**Step 4 — Verify arrival in Firestore**

Firebase Console → Firestore → `syncIngressEvents` collection → confirm document created with `status: accepted`.

**Step 5 — Verify sanitization**

Confirm no banned fields in the stored payload: no `email`, `accountNumber`, `routingNumber`, `lastFour`, `originalDescriptionRaw`, `promptText`, `outputText`.

**Step 6 — Test idempotency**

Send the same event twice (same `idempotencyKey`). Second response should be `{ ok: true, duplicate: true }`. No duplicate document in Firestore.

**Pass criteria:** event arrives, sanitized, stored, idempotent. Record the payload hash for audit.
