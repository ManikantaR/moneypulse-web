---
name: mw-implement-phase-slice
description: Implement the smallest validated MoneyPulse Web slice from a spec.
agent: mw-implementor
argument-hint: phase=<phase> slice=<smallest vertical slice> validation=<command or check>
---

Implement a single vertical slice.

Inputs:
- phase: ${input:phase:phase file or number}
- slice: ${input:slice:smallest deliverable slice}
- validation: ${input:validation:fastest check to run}

Steps:
1. Confirm the owning spec and direct code path.
2. State one falsifiable hypothesis.
3. Make the smallest edit that tests it.
4. Run the focused validation.
5. Perform a rubber-duck review and list any remaining risks.