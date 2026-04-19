# Phase 2 Spec - Dashboard and Transactions

## Goals

- Deliver mobile-first dashboard and transaction feed using projected data.

## Deliverables

1. KPI cards: income, expense, cash flow, budget usage.
2. Transactions list with search/filter chips and date ranges.
3. Empty/error states tuned for sync lag visibility.
4. Data freshness indicator per screen.

## Security Requirements

1. No account-number-like values rendered anywhere.
2. Description fields use sanitized projection only.
