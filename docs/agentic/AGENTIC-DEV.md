# AI-Assisted Development Guide

MoneyPulse Web is configured for GitHub Copilot and Claude Code autonomous development. Each phase has a spec, and each spec maps to exact agent commands.

## How to Start

**Always start from the lead agent.** Open GitHub Copilot Chat in VS Code, select `mw-lead` from the agent picker, then state your goal and target phase. The lead routes to the right specialist.

## Step-by-Step Workflow for Any Phase

```text
1. Open VS Code → Copilot Chat → select agent: mw-lead
2. State: "I want to work on Phase 1 auth — [your goal]"
3. Lead routes to mw-planner or mw-spec-generator first
4. After plan/spec: lead routes to mw-implementor for coding
5. After coding: mw-tester validates, mw-reviewer checks for regressions
6. Before handoff: rubber-duck review via /mw-rubber-duck prompt
```

## Phase-by-Phase Quick Commands

Paste these exactly into Copilot Chat after selecting the `mw-lead` agent (or the named specialist directly):

### Phase 0 — Foundation and Deploy Baseline ✅ Done

```text
/mw-phase-orchestrate phase=PHASE0 task=Complete deploy prerequisites constraints=all GCP APIs enabled Secret Manager and IAM configured
```

```text
/mw-review-phase-work target=PHASE0-SPEC.md focus=security
```

```text
/mw-rubber-duck work=Firebase deploy pipeline summary=need reliable repeatable deploy with least-privilege service account
```

### Phase 1 — Auth and Tenant Boundary ✅ Done

```text
/mw-phase-orchestrate phase=PHASE1 task=Implement auth login register reset-password and alias profile constraints=Firebase Auth email-password no anonymous auth
```

```text
/mw-implement-phase-slice phase=PHASE1 slice=login page and Firebase Auth hook validation=pnpm test
```

```text
/mw-review-phase-work target=PHASE1 auth implementation focus=security
```

### Phase 2 — Dashboard and Transactions ✅ Done

```text
/mw-phase-orchestrate phase=PHASE2 task=Dashboard KPI cards and transactions list from projected Firestore data constraints=no browser writes to projected collections
```

```text
/mw-implement-phase-slice phase=PHASE2 slice=dashboard KPI cards with sync freshness indicator validation=pnpm build
```

```text
/mw-rubber-duck work=transactions list filtering summary=need safe filtering on projected data without PII leakage
```

### Phase 3 — Categories, Budgets, Privacy ✅ Done

```text
/mw-phase-orchestrate phase=PHASE3 task=Category and budget views plus cloud-only alert overlays constraints=strict projected-vs-overlay boundary in Firestore rules
```

```text
/mw-implement-phase-slice phase=PHASE3 slice=category tree with spend totals validation=pnpm test
```

```text
/mw-review-phase-work target=PHASE3 overlay collections focus=security
```

### Phase 4 — AI Insights (Aggregate Only) 🚧 In Progress

```text
/mw-phase-orchestrate phase=PHASE4 task=Aggregate AI metrics cards and trend chart constraints=no raw prompt or output text minimum cohort size enforced
```

```text
/mw-implement-phase-slice phase=PHASE4 slice=aggregate AI metrics cards validation=pnpm build
```

### Phase 5 — Notifications and Web Push

```text
/mw-phase-orchestrate phase=PHASE5 task=FCM token registration and notification inbox constraints=minimal push payloads token scoped to alias boundary
```

```text
/mw-implement-phase-slice phase=PHASE5 slice=FCM token registration and browser permission flow validation=pnpm test
```

### Phase 6 — Hardening and Launch Readiness

```text
/mw-phase-orchestrate phase=PHASE6 task=Abuse tests rules review secret rotation drill and runbooks constraints=zero critical findings before launch
```

```text
/mw-review-phase-work target=PHASE6-SPEC.md focus=all
```

```text
/mw-rubber-duck work=production launch readiness summary=need checklist of what can and cannot be automated
```

### For Any Phase — Stress-Test a Spec First

```text
/mw-review-phase-work target=PHASE<N>-SPEC.md focus=all
```

## Skills Available as Slash Commands

| Slash command | When to use |
| --- | --- |
| `/grill-me` | When a design or spec is vague — forces branch-by-branch resolution |
| `/rubber-duck-review` | Before any handoff or completion |
| `/nextjs-firebase-slice` | When adding or updating a Firebase-backed Next.js screen |
| `/firestore-rules-review` | When changing Firestore rules — projected vs overlay audit |
| `/firebase-deploy-readiness` | Before any deploy change — APIs, secrets, IAM, workflow check |

## Pre-commit Hooks

On every commit, the following run automatically:

```bash
node scripts/validate-ai-customizations.mjs   # checks agent/skill/prompt structure
npx markdownlint-cli2 ...                      # lints AGENTS.md + .github + specs docs
```

To re-run manually:

```bash
node scripts/validate-ai-customizations.mjs
```

## Agent Roster

| Agent | Role |
| --- | --- |
| `mw-lead` | Entry point — routes to specialists |
| `mw-planner` | Architecture and slice planning |
| `mw-implementor` | Writes feature code |
| `mw-tester` | Validates tests and regressions |
| `mw-reviewer` | Security and data boundary review |
| `mw-spec-generator` | Expands phase specs into slices |

See [AGENTS.md](../../AGENTS.md) for full agent definitions.
