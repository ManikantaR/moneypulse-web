Implement the smallest validated slice for MoneyPulse Web using TDD.

**Inputs from the user:** phase, slice description (one screen, hook, component, or function), validation command.

**Steps:**

1. Read the owning `specs/PHASE<N>-SPEC.md` and confirm the slice is in scope.
2. Read the directly impacted files before touching anything.
3. State one falsifiable hypothesis: "If I implement X, then test Y will pass and Z will render correctly."
4. **Write the test first.** Create or update the test file. Run it — confirm it fails for the right reason.
5. Implement the minimum code to make the test pass.
6. Run `pnpm test` — all tests must pass.
7. Run `pnpm build` — build must succeed.
8. Rubber-duck review:
   - Data boundary preserved?
   - Rules updated if collections changed?
   - No browser write path for projected data?
   - Spec updated if contract changed?
9. State what remains manual (emulator test, deploy verification, etc.).

**UI slices:** use Tailwind + shadcn/ui. Mobile-first. Strong loading/empty/error/stale states always. No layout without all four states handled.

**Firebase slices:** route through `apps/web/src/lib/firebase.ts`. Use TanStack Query for data fetching. Server components first unless client state is required.

**Do not skip the test-first step.** If no test is possible, state why explicitly.
