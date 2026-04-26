---
name: nextjs-firebase-slice
description: Implement or refine a MoneyPulse Web frontend slice that reads de-identified Firebase data using Next.js, React 19, and the repository's data-boundary rules.
---

When using this skill:

- verify the owning phase spec first
- identify the page, hook, component, and Firebase data contract involved
- keep projected data read-only unless the spec explicitly defines a cloud-only overlay write
- add clear loading, empty, error, and freshness states
- validate with the smallest relevant build or test command

If the slice changes contracts, update the spec as part of the work.