# MoneyPulse Web

Cloud-hosted companion app for MoneyPulse with strict data boundary:

- Source of truth remains local MoneyPulse server
- One-way sync local → Firebase only
- No direct account numbers or PII in cloud data model
- Firebase Hosting + Firestore + Auth + Functions + FCM

## Phase Status

| Phase | What | Status |
|---|---|---|
| 0 | Foundation — deploy pipeline, sync ingress, IAM, Secret Manager | ✅ Done |
| 1 | Auth — Firebase email/password, alias profile, protected routes | ✅ Done |
| 2 | Dashboard and transactions read model | ✅ Done |
| 3 | Categories, budgets, privacy blur | ✅ Done |
| 4 | Aggregate AI insights (model health, latency, PII rate) | ✅ Done |
| 5 | Notifications and web push (FCM) | ✅ Done |
| 6 | Hardening, abuse tests, launch readiness | Planned |

→ Full phase specs: [specs/](specs/)

## Core Principles

1. Security-first and least-privilege by default
2. Zero-PII cloud projection
3. Deterministic alias mapping for user/account/entity identity
4. Mobile-first, data-dense fintech UI
5. Signed, idempotent sync events
6. GitHub Actions deploys authenticated with Google OIDC Workload Identity Federation

## Repository Layout

| Path | Purpose |
|---|---|
| `apps/web` | Next.js app (Firebase Hosting target) |
| `functions` | Firebase Cloud Functions (ingestion endpoint, push senders) |
| `specs` | Phased implementation specs |
| `docs/agentic` | Agent guides, rule set, memory, and inspiration |
| `.github/agents` | Custom agents for VS Code and Copilot CLI |
| `.github/prompts` | Reusable slash prompts |
| `.github/skills` | Portable agent skills |

## Quick Start (Local Dev)

```bash
pnpm install
pnpm test
pnpm build
```

## Data Boundary Contract

This repository must never contain:

- Local DB credentials
- Full account numbers or last four values
- Raw AI prompt/output text from local system
- Any reverse-sync endpoint to local MoneyPulse API

## Deploy Prerequisites (Phase 0 Checklist)

Before a full deploy will succeed, the following must be completed manually in GCP Console:

| Prerequisite | Where |
|---|---|
| Enable Firestore Rules API | GCP Console → APIs |
| Enable Cloud Functions API | GCP Console → APIs |
| Enable Cloud Build API | GCP Console → APIs |
| Enable Artifact Registry API | GCP Console → APIs |
| Enable Firebase Extensions API | GCP Console → APIs |
| Enable Secret Manager API | GCP Console → APIs |
| Enable Cloud Run API | GCP Console → APIs |
| Enable Eventarc API | GCP Console → APIs |
| Enable Cloud Billing API | GCP Console → APIs |
| Create `SYNC_SIGNING_SECRET` in Secret Manager | GCP Console → Secret Manager |
| Grant deploy SA `roles/secretmanager.viewer` (project level) | GCP Console → IAM |
| Grant compute SA `Secret Manager Secret Accessor` on the specific `SYNC_SIGNING_SECRET` secret | Secret Manager → secret → Permissions tab |
| GitHub secret `FIREBASE_PROJECT_ID` = project ID string not number | GitHub → repo Settings → Secrets |

See [specs/PHASE0-SPEC.md](specs/PHASE0-SPEC.md) for full detail and validation steps.

---

## AI-Assisted Development

→ **[docs/agentic/AGENTIC-DEV.md](docs/agentic/AGENTIC-DEV.md)** — full Copilot agent workflow, phase-by-phase commands, and slash skill reference.

→ Full agent guide: [docs/agentic/README.md](docs/agentic/README.md)
→ Rule set and checkpoints: [docs/agentic/rule-set.md](docs/agentic/rule-set.md)
→ Agent roster: [AGENTS.md](AGENTS.md)
→ Product plan and phase roadmap: [specs/MONEYPULSE-WEB-PLAN.md](specs/MONEYPULSE-WEB-PLAN.md)
