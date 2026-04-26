# Project Overview

MoneyPulse Web is the cloud-hosted companion to the local-first MoneyPulse application. It uses Next.js 16, Firebase Hosting, Firestore, Firebase Auth, Cloud Functions, and Firebase Cloud Messaging. The local MoneyPulse server is the source of truth; this repository only stores a de-identified cloud projection and cloud-only overlays such as preferences, alerts, and push delivery state.

## Architecture And Boundaries

- `apps/web` contains the frontend. Treat it as a mobile-first, data-dense fintech client.
- `functions` contains the Cloud Functions ingress and notification logic.
- `specs` contains the authoritative product plan and phased delivery specs.
- Cloud data must remain alias-based and de-identified.
- Never introduce reverse-sync writes to the local MoneyPulse system unless a future spec explicitly adds a command mailbox flow.
- Never store raw account numbers, last-four values, local database credentials, or raw local AI prompts in this repository.

## Build And Validation

- Use Node 22 and pnpm 10.32.1.
- Always run `pnpm install` before `pnpm build` or `pnpm test`.
- Repo-level validation is `pnpm test` then `pnpm build`.
- `apps/web` uses Next.js 16.2.x, React 19, Firebase SDK, TanStack Query, and Recharts.
- `functions` uses TypeScript, Firebase Functions v2, and Firebase Admin.
- Deploys run from `.github/workflows/deploy.yml` and require Google OIDC auth, Firebase secrets, and enabled GCP APIs.

## Known Deployment Facts

- `firebase.json` functions config requires `runtime: nodejs22`.
- The Firebase deploy currently scopes to `firestore,functions,hosting`.
- Required APIs include Firestore Rules, Cloud Functions, Cloud Build, Artifact Registry, Firebase Extensions, and Secret Manager.
- `SYNC_SIGNING_SECRET` is a Secret Manager secret consumed by `functions/src/index.ts`.
- The GitHub deploy service account must be able to read secret metadata and access secret values.

## Editing Expectations

- For product or architecture changes, update the relevant file in `specs/` first or alongside code.
- For UI work, preserve mobile-first density and prioritize fast scanability over decorative layouts.
- For Firebase rules or function ingress work, document threat model, idempotency, replay protection, and validation behavior.
- For docs, prefer explicit file inventories, decisions tables, dependency commands, validation commands, and acceptance criteria.

## Search Guidance

- Start from `specs/MONEYPULSE-WEB-PLAN.md` and the relevant `specs/PHASE*-SPEC.md` file.
- For ingest or security issues, inspect `functions/src/index.ts` and `functions/src/sync/security.ts`.
- For frontend work, inspect `apps/web/src/app` and `apps/web/src/lib/firebase.ts` first.

## Required Review Discipline

- Every change must pass a rubber-duck review against `docs/agentic/rule-set.md`.
- If a change is only partially validated, say exactly what remains manual.
- When instructions are complete and accurate, trust them before broad searching.