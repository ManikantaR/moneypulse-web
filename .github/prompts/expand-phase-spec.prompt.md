---
name: mw-expand-phase-spec
description: Expand a thin MoneyPulse Web phase spec into an implementation-ready document.
agent: mw-spec-generator
argument-hint: phase=<phase> feature=<feature> current-state=<summary>
---

Expand the target phase spec using the repository's established structure:

- status and goals
- decisions summary
- file inventory by layer
- dependency commands
- implementation steps
- validation and acceptance criteria
- risks and handoff notes

Inputs:
- phase: ${input:phase:phase file or number}
- feature: ${input:feature:feature area to expand}
- current-state: ${input:current-state:what is already implemented}

Ground the spec in existing code paths before inventing new files.