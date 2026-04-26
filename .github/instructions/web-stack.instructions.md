---
applyTo: "apps/web/**/*.ts,apps/web/**/*.tsx"
---

- Use App Router patterns compatible with Next.js 16 and React 19.
- Prefer server-first composition unless the feature clearly needs client state, browser APIs, Firebase Auth listeners, or FCM permissions.
- Keep the UI mobile-first, data-dense, and fintech-like. Favor clear information hierarchy, freshness indicators, and strong empty/loading/error states.
- All cloud-visible data must be alias-based and non-PII.
- When adding Firebase client usage, route initialization through `apps/web/src/lib/firebase.ts` or its direct successors instead of ad hoc configuration.
- Prefer focused TanStack Query hooks over mixing fetch logic into page components.
- If a feature introduces write-capable cloud overlays, state explicitly that the data is cloud-only and not reverse-synced to local MoneyPulse.