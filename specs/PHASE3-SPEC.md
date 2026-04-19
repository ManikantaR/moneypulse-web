# Phase 3 Spec - Categories, Budgets, Alerts

## Goals

- Expose category and budget views from projected data.

## Deliverables

1. Category tree with spend totals.
2. Budget progress cards and threshold states.
3. Alert center with unread handling.
4. Overlay preferences (pins/saved filters) stored cloud-only.

## Security Requirements

1. Overlay writes cannot mutate projected transaction records.
2. Rules enforce projected collections write-protected from browser clients.
