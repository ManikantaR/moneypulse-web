# MoneyPulse Web — Claude Code Guide

## What This Project Is

Cloud-hosted companion to the local MoneyPulse app (at `../MyMoney`). Runs on Firebase Hosting + Firestore + Auth + Functions + FCM. Local MoneyPulse is the permanent source of truth. This repo stores only a de-identified projection of household finance data and cloud-only user overlays.

**One-way sync only.** Local → Firebase. Never the reverse.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.2.x, React 19, App Router, Turbopack |
| UI | Tailwind CSS v4, shadcn/ui, Lucide React, next-themes |
| Data | TanStack Query v5, Recharts v3 |
| Auth/Cloud | Firebase SDK v12 (Auth, Firestore, Messaging) |
| Functions | Firebase Functions v2, Node 22, Firebase Admin |
| Tooling | pnpm 10.32.1, Turborepo, Vitest, Testing Library |
| Runtime | Node 22 |

## Repo Layout

| Path | Purpose |
|---|---|
| `apps/web` | Next.js app deployed to Firebase Hosting |
| `apps/web/src/app` | App Router pages and layouts |
| `apps/web/src/lib/firebase.ts` | Firebase client init — always route through this |
| `apps/web/src/lib/auth/` | Auth hooks and session bootstrap (Phase 1) |
| `apps/web/src/components/` | Feature components by area |
| `functions/src/index.ts` | `health` and `ingestSyncEvent` Cloud Functions |
| `functions/src/sync/security.ts` | HMAC signing, freshness check, idempotency |
| `firestore.rules` | Firestore access policy — treat as security-sensitive |
| `specs/` | Phase specs — read the relevant one before any work |
| `docs/agentic/` | Rule set, memory, agent guide |
| `.github/agents/` | Copilot agents (mw-lead through mw-tester) |
| `.github/prompts/` | Copilot prompt slash commands |
| `.github/skills/` | Copilot portable skills |

## Build and Validation

```bash
pnpm install          # always first
pnpm test             # Vitest across all packages
pnpm build            # Next.js + Functions build
pnpm dev              # local dev server (Turbopack)
```

Run `pnpm test` then `pnpm build` before marking any slice complete.

## TDD Mandate

**Tests come before implementation.** Every feature slice follows:

1. Write a failing test that describes the intended behavior.
2. Write the minimum code to make it pass.
3. Refactor if needed, keeping tests green.

For UI components use Vitest + Testing Library. For Firebase rules use the Firebase emulator. For sync functions use Vitest unit tests. Do not skip tests to ship faster.

## Data Boundary Contract — Non-Negotiable

**Never put in Firebase / Firestore:**
- Raw account numbers or last-four values
- Local DB credentials or secrets
- Raw local AI prompts or AI output text
- Any reverse-sync mutation endpoint to local MoneyPulse
- Bank institution real names (use aliases)

**Allowed in Firebase:**
- Alias-based identifiers (user, household, account, merchant, category)
- Sanitized transaction data (no direct PII)
- Aggregate AI observability metrics only
- Cloud-only overlays: preferences, saved filters, notification settings, FCM tokens
- Sync freshness metadata

## Firestore Data Split

| Type | Who writes | Browser can write? |
|---|---|---|
| Projected collections | `ingestSyncEvent` function only | No — read-only |
| Overlay collections | Authenticated user alias | Yes — cloud-only personalization |

## Security Requirements

- Firestore default deny — never weaken this as a shortcut
- Firebase Auth — no anonymous auth in production
- Cloud Functions: HMAC signature + timestamp freshness + idempotency key required on all sync ingress
- No secrets in code — use Secret Manager for functions, env vars for web (public config only)
- App Check — document scope before adding any new browser-callable function

## Code Review Standards

Before completing any slice, verify:

1. Data boundary contract preserved — no PII leaked to cloud
2. Firestore rules updated if collections changed
3. Tests written and passing (`pnpm test`)
4. Build passing (`pnpm build`)
5. No browser write path introduced for projected collections
6. Rubber-duck review completed (use `/rubber-duck` command)
7. Spec file updated if behavior or contracts changed

## Phase Roadmap

| Phase | Status |
|---|---|
| 0 — Foundation, deploy pipeline, sync ingress | ✅ Done and deployed |
| 1 — Auth, alias profiles, tenant boundary | ✅ Done |
| 2 — Dashboard and transactions read model | ✅ Done |
| 3 — Categories, budgets, privacy blur | ✅ Done |
| 4 — Aggregate AI insights | 🚧 In Progress — next |
| 5 — Notifications and web push (FCM) | Planned |
| 6 — Hardening, abuse tests, launch readiness | Planned |

Always read `specs/PHASE<N>-SPEC.md` before starting any phase work.

## Agent Workflow (Copilot in VS Code)

For GitHub Copilot: start with `mw-lead` agent, then route to specialists.
For Claude Code (this session): use `/phase-orchestrate`, `/implement-slice`, `/rubber-duck`, `/review-work` commands.

## Firebase Functions URL

To find the live `ingestSyncEvent` URL:

```
Firebase Console → Build → Functions → ingestSyncEvent row → copy Trigger URL
```

Or: Google Cloud Console → Cloud Run → service named `ingestsyncevent` → copy URL.

Format: `https://ingestsyncevent-[hash]-ue.a.run.app`

## Environment Variables

Web app uses `NEXT_PUBLIC_FIREBASE_*` env vars (public Firebase config only — no secrets).
Functions use Secret Manager for `SYNC_SIGNING_SECRET`. Never put signing secrets in env files committed to git.
See `.env.example` for the full list of required vars.

## Companion Repo

Local MoneyPulse app: `../MyMoney`
Sync domain in MyMoney: `../MyMoney/apps/api/src/sync/`
Phase 9 Sync Spec: `../MyMoney/PHASE9-SYNC-SPEC.md`
