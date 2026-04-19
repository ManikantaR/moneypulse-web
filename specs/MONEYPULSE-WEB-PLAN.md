# MoneyPulse Web Plan

## Architecture Summary

MoneyPulse Web is an independent cloud application hosted on Firebase in us-east4.

### Runtime Components

- Firebase Hosting: Next.js web frontend
- Cloud Firestore: de-identified projection store
- Firebase Auth: email/password with MFA-ready controls
- Cloud Functions: signed ingestion endpoint and notification orchestration
- Firebase Cloud Messaging: web push notifications
- App Check: enforced for browser clients and custom endpoints

## Product Constraints

- Single household per authenticated user
- Local MoneyPulse remains the system of record
- Cloud writes do not sync back to local by default
- No direct personal or financial identifiers in cloud documents

## Cloud Edit Strategy (Security-Preserving Compromise)

To support useful cloud interaction without introducing reverse data sync risk:

1. Cloud supports two categories of state:
- Projected state: immutable/mirror state pushed from local
- Overlay state: cloud-only personalization (UI preferences, saved filters, pinning)

2. Optional future mode: command mailbox
- Users can create edit intents in cloud (for example recategorize request)
- Intents are stored in a command collection with strict schema
- Local system can pull intents manually or on schedule and requires policy approval before apply
- Intents are never auto-applied

This model keeps one-way data authority while allowing cloud productivity features.

## Phase Roadmap

- Phase 0: Repo bootstrap, Firebase project setup, CI, base security
- Phase 1: Auth + tenancy + rules baseline
- Phase 2: Dashboard + transactions read model
- Phase 3: Categories, budgets, alerts
- Phase 4: AI aggregate insights
- Phase 5: In-app notifications + web push
- Phase 6: Hardening, abuse resistance, operational readiness
