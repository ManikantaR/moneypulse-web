Route a MoneyPulse Web task through the correct phase and specialist path.

You are orchestrating delivery for **moneypulse-web** (Firebase companion app).

**Inputs from the user:** phase number or area, goal/task description, constraints (security, UX, deploy, timeline).

**Steps:**

1. Read `specs/PHASE<N>-SPEC.md` for the target phase. State its current status (Planned / In Progress / Done).
2. Classify the work: planning, spec expansion, implementation, testing, security review, or research.
3. Check `docs/agentic/memory.md` and `docs/agentic/rule-set.md` for stable facts and constraints.
4. Identify the impacted files from the spec's file inventory. List them explicitly.
5. State the smallest validated slice that proves progress.
6. State the manual prerequisites (GCP APIs, secrets, IAM) if the work touches deploy or Firebase config.
7. Run the rubber-duck checkpoint before any implementation begins:
   - What is the exact problem?
   - What is the smallest change?
   - What invariant must stay true (data boundary, rules, auth)?
   - What validation proves success?
   - What breaks next if this succeeds?
8. Hand off to the right path: spec update → implementation → test → review.

**Hard constraints:**
- No PII in any Firestore collection.
- No browser write path for projected collections.
- Firestore rules must be updated when collections change.
- TDD: tests before implementation.
