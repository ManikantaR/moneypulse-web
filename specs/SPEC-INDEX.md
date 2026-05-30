# MoneyPulse Web — Spec Index

> All phase specs for the Firebase companion web app.
> Companion app specs live in the MyMoney repository under `specs/`.

## Master Plan

| Document | Description |
| --- | --- |
| [MONEYPULSE-WEB-PLAN.md](MONEYPULSE-WEB-PLAN.md) | Product plan — cloud data model, sync direction, runtime components |

## Phase Specs

| Phase | Status | Summary | Spec |
| --- | --- | --- | --- |
| 0 | ✅ Done | Foundation: Firebase scaffold, Firestore rules, signed ingress, deploy pipeline | [PHASE0-SPEC.md](PHASE0-SPEC.md) |
| 1 | ✅ Done | Auth: Firebase email/password, alias profile bootstrap, tenant boundary | [PHASE1-SPEC.md](PHASE1-SPEC.md) |
| 2 | ✅ Done | Dashboard: KPI cards, monthly nav, spending breakdown, transactions feed | [PHASE2-SPEC.md](PHASE2-SPEC.md) |
| 3 | ✅ Done | Categories and budgets: per-category spend bars, budget progress, privacy blur | [PHASE3-SPEC.md](PHASE3-SPEC.md) |
| 4 | ✅ Done | AI insights: aggregate metrics only, no raw prompts/outputs | [PHASE4-SPEC.md](PHASE4-SPEC.md) |
| 5 | ✅ Done | Notifications: FCM push, service worker, notification inbox, device tokens | [PHASE5-SPEC.md](PHASE5-SPEC.md) |
| 6 | ✅ Done | Hardening: ingress abuse tests, runbooks, launch checklist | [PHASE6-SPEC.md](PHASE6-SPEC.md) |

## Cross-Repo Dependencies

| MyMoney Phase | Impact on This Repo |
| --- | --- |
| Phase 9 (Sync) | **Critical** — the outbox sync pipeline is the sole data source for all projected collections |
| Phase 10 (Features) | Receipt OCR results, recurring bill data, and anomaly alerts will need new projected collections and web UI |
| Phase 3 (AI) | Category and rule data flows through sync to populate category views here |
| Phase 6 (Budgets) | Budget totals projected via sync for the budgets page |

## Notes

- All data displayed in this app comes from the MyMoney sync pipeline (Phase 9).
- Browser clients can only write to overlay collections (preferences, FCM tokens, saved filters).
- Projected collections are read-only from the browser — enforced by Firestore rules.
- Phase numbering in this repo is independent from MyMoney's numbering.
