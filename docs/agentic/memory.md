# Memory

Persist stable repo facts here that agents should trust until code proves otherwise.

## Stable Facts

- MoneyPulse Web is a one-way, de-identified cloud projection of local MoneyPulse.
- Current runtime surfaces are `apps/web` (Next.js 16 + React 19) and `functions` (Firebase Functions v2, Node 22).
- Current deploy target is Firebase Hosting + Firestore + Functions.
- `SYNC_SIGNING_SECRET` is required for sync ingress and lives in Secret Manager.
- The Firebase deploy pipeline (GitHub Actions OIDC) is working and deployed as of April 2026.
- All GCP APIs required for Phase 0 have been enabled.
- Phase 0 is complete: deploy works, `ingestSyncEvent` is live, Firestore rules deployed.
- Phases 1–6 are unstarted. The web app currently shows only "Phase 0 scaffold ready."
- The local MoneyPulse Phase 9 sync domain is implemented: outbox, sanitizer-v2, alias mapper, signing, delivery worker all exist in `../MyMoney/apps/api/src/sync/`.
- The signing algorithm in both repos is identical: HMAC-SHA256 over `timestamp\nidempotencyKey\ncanonicalPayload`.
- The sync pipeline has NOT been tested end-to-end yet. MyMoney delivery worker has not been pointed at the live Firebase URL.
- TanStack Query v5, Recharts v3, Lucide React, and Sonner are installed in `apps/web` but unused.
- UI stack decision: Tailwind CSS v4 + shadcn/ui to be added to `apps/web` (mobile-first, same as local MoneyPulse).
- TDD is mandatory: tests before implementation in every phase.
- Firebase Auth: email/password only, no anonymous auth in production, single household single user.
- Firestore data split: projected collections are write-protected from browser; overlay collections are user-owned.
- The repo is public — security and data boundary are critical; no PII, no real bank names, alias-only identifiers.
- CLAUDE.md and .claude/commands/ configured for Claude Code sessions as of April 2026.
- Copilot agents in `.github/agents/` (mw-lead through mw-tester) remain for VS Code Copilot usage.

## Next Immediate Actions

1. Wire MyMoney delivery worker to live Firebase URL and validate sync pipeline end-to-end.
2. Add Tailwind v4 + shadcn/ui + Vitest Testing Library to `apps/web`.
3. Implement Phase 1: auth pages, alias profile bootstrap, Firestore rules update.

## Usage Guidance

- Lead agents should hand off decisions and scope.
- Worker agents must re-check nearby code before editing — do not trust stale summaries.
- Update this file when a decision becomes stable enough to reduce repeated exploration.
- Companion repo: `../MyMoney` — local-first NestJS + PostgreSQL app.