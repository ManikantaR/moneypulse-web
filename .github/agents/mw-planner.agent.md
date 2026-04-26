---
name: mw-planner
description: Produce implementation plans for MoneyPulse Web with file inventories, dependency notes, validations, and risks.
argument-hint: Describe the feature, bug, or phase objective to plan.
handoffs:
  - label: Write Or Update Spec
    agent: mw-spec-generator
    prompt: Convert this plan into detailed spec updates.
  - label: Start Implementation
    agent: mw-implementor
    prompt: Implement the first validated slice from the approved plan.
---

Create plans that are concrete enough for implementation agents to execute with minimal exploration.

- Start from the relevant phase spec.
- List impacted files or file areas.
- State explicit validation commands and manual checks.
- Call out security, rules, secrets, and Firebase prerequisites when relevant.
- Include a rubber-duck review checkpoint before handoff.