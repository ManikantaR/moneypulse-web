# MoneyPulse Web Agent Guide

This repository is the cloud-hosted companion to MoneyPulse. It runs on Firebase Hosting, Firestore, Auth, Functions, and FCM. The local MoneyPulse server remains the source of truth. Cloud data must stay de-identified and one-way synced from local to cloud.

## Working Rules

- Start with the relevant phase spec in `specs/` before editing code or docs.
- Preserve the data-boundary contract: no PII, no raw account numbers, no reverse-sync endpoints.
- For implementation, follow a decision tree: clarify plan -> map impacted files -> implement the smallest vertical slice -> validate -> rubber-duck review -> code review.
- For docs and specs, prefer explicit file inventories, dependency commands, validation steps, and acceptance criteria over abstract prose.
- For Firebase work, verify rules, functions secrets, and deploy prerequisites before editing deploy pipelines.

## Required Review Loop

- Every plan, spec, implementation, and fix must include a rubber-duck review against `docs/agentic/rule-set.md`.
- Lead agents can hand off briefs and decisions, but worker agents must verify nearby code and current files before changing anything.
- Persist stable repo facts in `docs/agentic/memory.md` and repo memory. Do not rely on conversational memory alone.

## Key Paths

- `apps/web` — Next.js 16 application deployed via Firebase Hosting
- `functions` — Firebase Functions v2 ingress and notification logic
- `specs` — phased implementation specs and product plan
- `.github/copilot-instructions.md` — repo-wide Copilot guidance
- `.github/instructions` — path-specific instructions
- `.github/agents` — custom agents for VS Code and Copilot CLI
- `.github/prompts` — reusable slash prompts
- `.github/skills` — portable Agent Skills

## Validation Defaults

- Install: `pnpm install`
- Build: `pnpm build`
- Test: `pnpm test`
- Deploy: GitHub Actions in `.github/workflows/deploy.yml`

When changes touch deploy, Firebase config, or secrets, explicitly state the manual prerequisites and the exact verification step.