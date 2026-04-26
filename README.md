# MoneyPulse Web

Cloud-hosted companion app for MoneyPulse with strict data boundary:

- Source of truth remains local MoneyPulse server
- One-way sync local → Firebase only
- No direct account numbers or PII in cloud data model
- Firebase Hosting + Firestore + Auth + Functions + FCM

→ Full agent guide: [docs/agentic/README.md](docs/agentic/README.md)  
→ Rule set and checkpoints: [docs/agentic/rule-set.md](docs/agentic/rule-set.md)  
→ Agent roster: [AGENTS.md](AGENTS.md)  
→ Product plan and phase roadmap: [specs/MONEYPULSE-WEB-PLAN.md](specs/MONEYPULSE-WEB-PLAN.md)

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

For deploy-related work, see [specs/PHASE0-SPEC.md](specs/PHASE0-SPEC.md) for the full list of GCP APIs, IAM roles, and Secret Manager prerequisites.

## Data Boundary Contract

This repository must never contain:

- Local DB credentials
- Full account numbers or last four values
- Raw AI prompt/output text from local system
- Any reverse-sync endpoint to local MoneyPulse API

---

## AI-Assisted Development

MoneyPulse Web is configured for GitHub Copilot autonomous development. Each phase has a spec, and each spec maps to exact agent commands.

### How to Start

**Always start from the lead agent.** Open GitHub Copilot Chat in VS Code, select `mw-lead` from the agent picker, then state your goal and target phase. The lead routes to the right specialist.

### Step-by-Step Workflow for Any Phase

```
1. Open VS Code → Copilot Chat → select agent: mw-lead
2. State: "I want to work on Phase 1 auth — [your goal]"
3. Lead routes to mw-planner or mw-spec-generator first
4. After plan/spec: lead routes to mw-implementor for coding
5. After coding: mw-tester validates, mw-reviewer checks for regressions
6. Before handoff: rubber-duck review via /mw-rubber-duck prompt
```

### Phase-by-Phase Quick Commands

Paste these exactly into Copilot Chat after selecting the `mw-lead` agent (or the named specialist directly):

#### Phase 0 — Foundation and Deploy Baseline

```
/mw-phase-orchestrate phase=PHASE0 task=Complete deploy prerequisites constraints=all GCP APIs enabled Secret Manager and IAM configured
```

```
/mw-review-phase-work target=PHASE0-SPEC.md focus=security
```

```
/mw-rubber-duck work=Firebase deploy pipeline summary=need reliable repeatable deploy with least-privilege service account
```

#### Phase 1 — Auth and Tenant Boundary

```
/mw-phase-orchestrate phase=PHASE1 task=Implement auth login register reset-password and alias profile constraints=Firebase Auth email-password no anonymous auth
```

```
/mw-expand-phase-spec phase=PHASE1 feature=alias profile bootstrap current-state=no auth UI exists yet
```

```
/mw-implement-phase-slice phase=PHASE1 slice=login page and Firebase Auth hook validation=pnpm test
```

```
/mw-review-phase-work target=PHASE1 auth implementation focus=security
```

#### Phase 2 — Dashboard and Transactions

```
/mw-phase-orchestrate phase=PHASE2 task=Dashboard KPI cards and transactions list from projected Firestore data constraints=no browser writes to projected collections
```

```
/mw-implement-phase-slice phase=PHASE2 slice=dashboard KPI cards with sync freshness indicator validation=pnpm build
```

```
/mw-rubber-duck work=transactions list filtering summary=need safe filtering on projected data without PII leakage
```

#### Phase 3 — Categories, Budgets, Alerts

```
/mw-phase-orchestrate phase=PHASE3 task=Category and budget views plus cloud-only alert overlays constraints=strict projected-vs-overlay boundary in Firestore rules
```

```
/mw-implement-phase-slice phase=PHASE3 slice=category tree with spend totals validation=pnpm test
```

```
/mw-review-phase-work target=PHASE3 overlay collections focus=security
```

#### Phase 4 — AI Insights (Aggregate Only)

```
/mw-phase-orchestrate phase=PHASE4 task=Aggregate AI metrics cards and trend chart constraints=no raw prompt or output text minimum cohort size enforced
```

```
/mw-implement-phase-slice phase=PHASE4 slice=aggregate AI metrics cards validation=pnpm build
```

#### Phase 5 — Notifications and Web Push

```
/mw-phase-orchestrate phase=PHASE5 task=FCM token registration and notification inbox constraints=minimal push payloads token scoped to alias boundary
```

```
/mw-implement-phase-slice phase=PHASE5 slice=FCM token registration and browser permission flow validation=pnpm test
```

#### Phase 6 — Hardening and Launch Readiness

```
/mw-phase-orchestrate phase=PHASE6 task=Abuse tests rules review secret rotation drill and runbooks constraints=zero critical findings before launch
```

```
/mw-review-phase-work target=PHASE6-SPEC.md focus=all
```

```
/mw-rubber-duck work=production launch readiness summary=need checklist of what can and cannot be automated
```

#### For Any Phase — Stress-Test a Spec First

```
/mw-review-phase-work target=PHASE<N>-SPEC.md focus=all
```

### Skills Available as Slash Commands

| Slash command | When to use |
|---|---|
| `/grill-me` | When a design or spec is vague — forces branch-by-branch resolution |
| `/rubber-duck-review` | Before any handoff or completion |
| `/nextjs-firebase-slice` | When adding or updating a Firebase-backed Next.js screen |
| `/firestore-rules-review` | When changing Firestore rules — projected vs overlay audit |
| `/firebase-deploy-readiness` | Before any deploy change — APIs, secrets, IAM, workflow check |

### Pre-commit Hooks

On every commit, the following run automatically:

```bash
node scripts/validate-ai-customizations.mjs   # checks agent/skill/prompt structure
npx markdownlint-cli2 ...                      # lints AGENTS.md + .github + specs docs
```

To re-run manually:

```bash
node scripts/validate-ai-customizations.mjs
```

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
