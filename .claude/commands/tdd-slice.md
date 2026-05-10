TDD workflow for a MoneyPulse Web feature slice. Use this for any new component, hook, or function.

**Inputs from the user:** what to build, which phase it belongs to.

**The TDD cycle — do not skip steps:**

### Step 1: Define the contract
State in one sentence what the component/hook/function does, its inputs, and its outputs.

### Step 2: Write the test file first
```typescript
// apps/web/src/__tests__/ComponentName.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('ComponentName', () => {
  it('renders loading state', () => { ... })
  it('renders data when loaded', () => { ... })
  it('renders empty state when no data', () => { ... })
  it('renders error state on failure', () => { ... })
})
```

Run: `pnpm test` — confirm tests **fail** (not error — fail means the contract is clear).

### Step 3: Implement minimum code
Write only enough to make the failing tests pass. No extras.

### Step 4: Run full suite
```bash
pnpm test    # all tests green
pnpm build   # build passes
```

### Step 5: Rubber-duck check
- Data boundary preserved?
- Mobile-first layout with all states (loading, empty, error, stale)?
- No hardcoded PII or test data left in code?

### Step 6: Update spec
If the slice changes file inventory or data contracts, update `specs/PHASE<N>-SPEC.md`.

**Testing utilities available:**
- `vitest` + `@testing-library/react` for UI components
- Firebase emulator for Firestore/Auth integration tests
- `msw` for mocking fetch calls if needed

**For Firebase hooks:** mock the Firebase SDK in tests. Do not call real Firebase from unit tests.
