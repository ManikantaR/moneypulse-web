---
applyTo: "functions/**/*.ts,firebase.json,firestore.rules,firestore.indexes.json,.github/workflows/*.yml"
---

- Treat Firebase deploy, rules, and secret changes as security-sensitive.
- Keep Cloud Functions in `us-east4` unless a spec explicitly changes the region.
- Any secret consumed by functions must be documented in specs or ops docs and validated against deploy prerequisites.
- Preserve ingress security controls: signed payloads, freshness checks, idempotency keys, and timing-safe signature verification.
- Do not weaken Firestore rules to simplify a feature. Update the spec and explain the least-privilege reasoning for any rules change.
- When changing deploy workflow behavior, document manual prerequisites such as GCP APIs, IAM roles, or Secret Manager permissions.