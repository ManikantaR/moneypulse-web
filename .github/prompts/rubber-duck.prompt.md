---
name: mw-rubber-duck
description: Run the mandatory rubber-duck review for MoneyPulse Web plans, specs, fixes, or implementations.
agent: mw-reviewer
argument-hint: work=<plan/spec/change> summary=<one line>
---

Run the rubber-duck checklist from `docs/agentic/rule-set.md`.

Inputs:
- work: ${input:work:what is being reviewed}
- summary: ${input:summary:one-line problem statement}

Output:
1. The problem.
2. The smallest solving change.
3. The invariant or security consequence if wrong.
4. The validation that proves success.
5. The next likely failure mode.