---
applyTo: "README.md,docs/**/*.md,specs/**/*.md,AGENTS.md,.github/prompts/*.md,.github/agents/*.md,.github/skills/**/SKILL.md"
---

- Write docs for autonomous agents, not just humans skimming prose.
- Prefer this order: status, decisions, scope, file inventory, implementation steps, validation, risks, handoff.
- Make commands copy-pasteable and repo-specific.
- Explicitly call out manual steps, secrets, APIs, and IAM prerequisites.
- Keep prompts and agents action-oriented with clear entry conditions, output expectations, and handoff rules.
- Every spec, plan, or implementation workflow must include a rubber-duck review checkpoint.