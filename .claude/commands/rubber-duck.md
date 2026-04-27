Run the mandatory rubber-duck review for MoneyPulse Web before any handoff or completion.

**Input from the user:** what was built or changed, and a one-line problem statement.

**Answer each of these five questions. If any answer is fuzzy, keep refining.**

1. **The exact problem.** What was broken, missing, or needed? One sentence.

2. **The smallest solving change.** What is the minimum edit that addresses the problem without touching unrelated code?

3. **The invariant that must remain true.** For MoneyPulse Web this is almost always one of:
   - No PII in Firestore
   - No browser writes to projected collections
   - Firestore rules enforce alias-based isolation
   - Signed ingress is the only write path for projected data

4. **The validation that proves success.** Name the exact command, test file, or manual step. Do not say "it should work" — say how you know.

5. **The next likely failure mode.** What breaks after this change succeeds? Example: rules update deploys but index is missing; auth hook works but profile bootstrap race condition surfaces on slow networks.

If all five are answered cleanly: the work is ready. If any is fuzzy: state what needs clarification before proceeding.
