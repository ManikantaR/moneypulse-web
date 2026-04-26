---
name: mw-phase-orchestrate
description: Route a MoneyPulse Web task through the right specialist agent and phase context.
agent: mw-lead
argument-hint: phase=<phase> task=<goal> constraints=<constraints>
---

You are coordinating work in MoneyPulse Web.

Inputs:
- phase: ${input:phase:phase number or area}
- task: ${input:task:goal or request}
- constraints: ${input:constraints:security, deploy, timeline, or UX constraints}

Steps:
1. Identify the owning spec in `specs/`.
2. Decide whether the next step belongs to planning, spec generation, implementation, testing, review, architecture, security, or research.
3. Summarize the next specialist handoff in 5-10 lines.
4. If information is missing, state exactly what to research or read.
5. Include the rubber-duck checkpoint before implementation begins.