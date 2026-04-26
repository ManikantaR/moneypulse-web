# MoneyPulse Web Plan

> Status: Phase 0 foundation is partially implemented. The repository has Firebase deploy scaffolding, a signed sync ingress function, Firestore rules, and a minimal Next.js application. Product phases 1-6 still need implementation-grade specs and delivery sequencing.

## Product Summary

MoneyPulse Web is the cloud-hosted companion to local-first MoneyPulse. It exists to provide mobile-friendly remote access to a de-identified projection of household finance data while keeping the local MoneyPulse installation as the system of record.

The repository must optimize for three outcomes at the same time:

1. Useful cloud access from web and mobile browsers.
2. Strong privacy boundaries and least privilege.
3. Agent-friendly documentation and delivery workflows.

## Decisions Summary

| Decision | Choice | Why it matters |
| --- | --- | --- |
| Source of truth | Local MoneyPulse only | Prevents cloud drift and reverse-sync complexity |
| Cloud data model | De-identified projection + cloud-only overlays | Allows remote UX without storing PII |
| Sync direction | Local -> cloud only | Reduces security and reconciliation risk |
| Cloud runtime | Firebase Hosting + Firestore + Auth + Functions + FCM | Fast delivery with strong managed controls |
| Functions region | `us-east4` | Matches current deploy assumptions |
| Sync auth | HMAC signature + timestamp freshness + idempotency key | Protects ingress from tampering and replay |
| Secret storage | Secret Manager | Required for ingress signing secret |
| Browser writes | Overlays only | Projected records stay read-only from browser clients |
| Prompt and agent system | Repo-level instructions + agents + prompts + skills | Supports autonomous delivery in VS Code and Copilot CLI |

## Runtime Components

- Firebase Hosting: hosts `apps/web`
- Cloud Firestore: stores projected collections and overlay collections
- Firebase Auth: browser authentication and tenant boundary root
- Cloud Functions v2: sync ingress, future notification orchestration, future background utilities
- Firebase Cloud Messaging: browser push transport
- App Check: browser abuse resistance for production clients

## Data Boundary Contract

### Allowed In Cloud

- Alias-based user, household, account, merchant, and category identifiers
- Projected transaction data stripped of direct identifiers
- Aggregate AI observability metrics only
- Cloud-only personalization overlays such as saved filters, notification preferences, and pinning
- Delivery metadata such as FCM token state and sync freshness metadata

### Forbidden In Cloud

- Raw account numbers or account last-four values
- Local DB credentials or secrets
- Raw local AI prompts or AI output text
- Reverse-sync mutation endpoints to local MoneyPulse
- Local auth tokens or private server runtime secrets

## Cloud Edit Strategy

To preserve one-way authority while still allowing useful cloud UX, cloud state is split into two categories.

### Projected State

- Written by signed sync ingress only
- Browser clients may read but not mutate
- Includes transactions, rollups, category totals, and related read models

### Overlay State

- Cloud-only personalization owned by the authenticated user alias
- May include preferences, saved filters, inbox state, notification settings, and device registration
- Never mutates the upstream local MoneyPulse records directly

### Optional Future Mode: Command Mailbox

This is not part of the current implementation scope. If introduced later:

- user intent writes would land in a dedicated command collection
- local MoneyPulse would pull and approve commands explicitly
- commands would never auto-apply without local policy approval

## Sync Mechanics

### Current Direction

- Local MoneyPulse sends signed sync events to Cloud Functions
- Functions verify headers, signature, freshness window, and idempotency key
- Accepted payloads are persisted into Firestore projection collections

### Sync Guarantees To Preserve

- deterministic idempotency per event
- no browser bypass for projected data writes
- replay resistance through timestamp validation
- explicit schema versioning when payload contracts change

## Repository Layout

| Path | Purpose |
| --- | --- |
| `apps/web` | Next.js application deployed to Hosting |
| `functions` | Functions ingress and future notification/send logic |
| `firebase.json` | Hosting, functions, and Firestore deploy config |
| `firestore.rules` | Firestore access policy |
| `firestore.indexes.json` | Query index config |
| `.github/workflows/ci.yml` | PR validation |
| `.github/workflows/deploy.yml` | production deploy |
| `docs/agentic` | repo rules, memory, inspiration, and operator guide |
| `.github/agents` | custom agents for VS Code and Copilot CLI |
| `.github/prompts` | reusable slash prompts |
| `.github/skills` | portable skills |

## Delivery Rules

- Every feature phase must specify decisions, file inventory, validation steps, and exit criteria.
- Every implementation must run a rubber-duck review before completion.
- Every security-sensitive change must identify the manual prerequisites that automation cannot satisfy alone.

## Phase Roadmap

- Phase 0: repository bootstrap, Firebase setup, deploy pipeline, base rules, ingress foundation
- Phase 1: auth, alias profiles, tenant boundary, rules baseline
- Phase 2: dashboard and transactions read model
- Phase 3: categories, budgets, alerts, cloud-only overlays
- Phase 4: aggregate AI insights with minimum cohort rules
- Phase 5: in-app notifications and web push delivery
- Phase 6: hardening, abuse resistance, deploy readiness, operational runbooks

## Validation Baseline

```bash
pnpm install
pnpm test
pnpm build
```

For deploy-sensitive work, the spec must also name:

- required GCP APIs
- required GitHub secrets
- required Secret Manager secrets
- required IAM bindings
- exact rerun step for deploy verification
