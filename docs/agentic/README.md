# Agentic Development Guide

This repository is configured for GitHub Copilot customization in both VS Code chat and Copilot CLI sessions.

## Included Surfaces

- `AGENTS.md` — repo-wide agent operating guidance
- `.github/copilot-instructions.md` — always-on repo instructions
- `.github/instructions` — path-specific instructions
- `.github/agents` — custom agents
- `.github/prompts` — reusable slash prompts
- `.github/skills` — portable Agent Skills
- `docs/agentic/rule-set.md` — mandatory review and decision-tree rules

## Recommended Workflow

1. Start with `mw-lead` to route the task.
2. Use `mw-planner` or `mw-spec-generator` before major implementation.
3. Use `mw-implementor` for coding work.
4. Run `mw-tester` and `mw-reviewer` before completion.
5. Use the `rubber-duck-review` skill or `/mw-rubber-duck` prompt before handoff.

## VS Code Usage

1. Open Chat Customizations.
2. Select the repository agent such as `mw-lead`.
3. Run prompt files from `/` such as `/mw-phase-orchestrate` or `/mw-expand-phase-spec`.
4. Run skills from `/` such as `/grill-me` or `/rubber-duck-review`.

## Copilot CLI Notes

- In VS Code Copilot CLI sessions, workspace custom agents can be selected when creating the session.
- Prompt files and skills are available as slash commands in Copilot CLI sessions.
- Recommended entry points:
  - `/mw-phase-orchestrate phase=PHASE2 task=Build dashboard and transactions read model constraints=keep projected data read-only`
  - `/mw-expand-phase-spec phase=PHASE5 feature=FCM push delivery current-state=only phase placeholder exists`
  - `/mw-rubber-duck work=sync ingress hardening summary=need replay-safe and least-privilege ingress`

## Memory Best Practice

- Keep stable repo facts in `docs/agentic/memory.md` and repo memory.
- Let the lead agent pass brief and decision context.
- Let worker agents re-check nearby code before editing rather than trusting stale summaries blindly.