# Phase 2 Spec - Dashboard and Transactions

> Status: Planned. Current `apps/web` only contains the base app shell. This phase creates the first user-visible product surface on top of projected data.

## Goals

- Deliver a mobile-first dashboard using projected read models
- Deliver a transactions feed with safe filtering and sync freshness visibility
- Keep all projected data read-only from browser clients

## Decisions Summary

| Decision | Choice |
| --- | --- |
| Screen priority | dashboard first, then transactions list |
| Data ownership | projected Firestore collections only |
| Browser writes | none for projected data |
| Freshness UX | show last sync and empty states clearly |
| PII handling | render only sanitized projected fields |

## Deliverables

1. KPI cards for income, expense, cash flow, and budget usage
2. Transactions list with search, filter chips, and date ranges
3. Empty, loading, stale, and error states tuned for sync lag visibility
4. Data freshness indicator on dashboard and transactions views

## File Inventory

| File Area | Purpose |
| --- | --- |
| future `apps/web/src/app/(dashboard)/page.tsx` | dashboard route |
| future `apps/web/src/app/(dashboard)/transactions/page.tsx` | transactions route |
| future `apps/web/src/components/dashboard/*` | KPI cards and freshness banners |
| future `apps/web/src/components/transactions/*` | rows, filters, empty states |
| future `apps/web/src/lib/queries/*` | TanStack Query hooks or equivalent data loaders |
| `firestore.indexes.json` | indexes for transaction filtering and sorting |

## Data Model Expectations

The UI must consume only sanitized projected fields. Suggested read-model responsibilities:

- transaction amount
- effective date
- merchant alias or sanitized label
- category alias or label safe for cloud
- sync timestamps or freshness metadata

Not allowed in rendered data:

- raw account numbers
- last four digits
- raw local descriptions if sanitization is incomplete

## UI Requirements

### Dashboard

- KPI cards should prioritize fast scanability on mobile
- freshness indicator should state when the last sync occurred
- empty state should clearly explain that the local MoneyPulse instance has not synced yet

### Transactions

- filters should support date range and category focus
- list should support large result sets without unreadable layouts
- every state must explain whether the issue is no data, stale sync, or loading failure

## Security Requirements

1. No account-number-like values rendered anywhere
2. Description fields use sanitized projection only
3. Browser clients cannot mutate projected transactions
4. Rules and indexes must not implicitly broaden access

## Validation

- render dashboard with seeded/mock projected data
- render transactions with 50+ items and common filters
- verify no browser write path exists for projected collections
- verify rules deny direct transaction writes from browser clients
- verify indexes support target transaction queries

## Exit Criteria

- dashboard renders KPIs and freshness state
- transactions view renders filtered results and safe empty/error states
- projected data remains browser read-only
- no disallowed identifiers are shown in the UI
