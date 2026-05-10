Review a MoneyPulse Web spec, plan, or implementation for correctness, security, and completeness.

**Inputs from the user:** target (spec file, files changed, or change summary), focus area (bugs, security, tests, architecture, or all).

**Review checklist — present findings ordered by severity:**

**Security (always check):**
- [ ] No PII or raw account data in any Firestore collection
- [ ] No reverse-sync endpoint introduced
- [ ] Projected collections remain browser read-only
- [ ] Firestore rules updated and not weakened
- [ ] Auth context checked before any data access
- [ ] Secrets not in code (Secret Manager for functions, NEXT_PUBLIC_ prefix for web-only config)
- [ ] HMAC ingress controls preserved in functions

**Tests:**
- [ ] Tests written before or alongside implementation (TDD)
- [ ] All edge cases covered: loading, empty, error, stale, unauthenticated
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes

**Architecture:**
- [ ] Firebase client routed through `apps/web/src/lib/firebase.ts`
- [ ] TanStack Query used for data fetching, not ad hoc fetch
- [ ] Server components used unless client state is necessary
- [ ] Slice is minimal — no premature abstraction

**Docs:**
- [ ] Spec updated if behavior or file inventory changed
- [ ] `docs/agentic/memory.md` updated if a stable fact changed
- [ ] Manual prerequisites documented if deploy or secrets are involved

After findings, state: what must be fixed before merge, what is advisory.
