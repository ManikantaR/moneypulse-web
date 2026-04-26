# Memory

Persist stable repo facts here that agents should trust until code proves otherwise.

## Stable Facts

- MoneyPulse Web is a one-way, de-identified cloud projection of local MoneyPulse.
- Current runtime surfaces are `apps/web` and `functions`.
- Current deploy target is Firebase Hosting + Firestore + Functions.
- `SYNC_SIGNING_SECRET` is required for sync ingress.
- The implementation surface is still early; specs need to be more detailed than code.

## Usage Guidance

- Lead agents should hand off decisions and scope.
- Worker agents should still re-check nearby code before editing.
- Update this file when a decision becomes stable enough to reduce repeated exploration.