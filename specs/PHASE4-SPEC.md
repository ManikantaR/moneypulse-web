# Phase 4 Spec - AI Insights (Aggregate Only)

> Status: 🚧 In Progress. Implementing aggregate AI metrics sync from local MoneyPulse (ai_prompt_logs → outbox → Firestore aiMetrics) and the web display page.

## Goals

- Provide AI observability without exposing sensitive prompts or raw outputs
- Limit AI visibility to safe aggregates and trend metrics
- Make model quality visible to users and operators without leaking source data

## Decisions Summary

| Decision | Choice |
| --- | --- |
| Data granularity | aggregate only |
| Raw prompts | forbidden |
| Raw outputs | forbidden |
| Display threshold | minimum cohort size required before rendering |
| Export scope | aggregate metrics only |

## Deliverables

1. Aggregate cards for total runs, average latency, and category coverage
2. Trend chart for PII detection rate and model health
3. Time filters and export of aggregate metrics only

## File Inventory

| File Area | Purpose |
| --- | --- |
| future `apps/web/src/app/(dashboard)/ai-insights/page.tsx` | AI insights route |
| future `apps/web/src/components/ai/*` | aggregate cards and trend components |
| future `functions/src/ai/*` | aggregate ingestion or transformation helpers if required |
| `firestore.rules` | restrict aggregate visibility appropriately |

## Data Contract

Allowed metrics include:

- run counts
- latency percentiles or averages
- category coverage percentages
- PII detection or sanitization counts
- model health flags safe for cloud display

Forbidden metrics include:

- prompt text
- output text
- merchant raw strings
- transaction-level AI reasoning content

## Security Requirements

1. No prompt text, output text, or merchant raw strings
2. Aggregates must satisfy minimum cohort size before display
3. Exports must contain only safe aggregate fields

## Validation

- verify all stored AI metrics are aggregate-only
- verify UI hides metrics when minimum cohort threshold is not met
- verify exports contain no raw strings or low-cardinality leakage
- verify rules do not expose any underlying raw AI collections if they ever exist elsewhere

## Exit Criteria

- AI insights screen renders safe aggregate metrics only
- trend charts and filters operate without leaking low-volume details
- exported data remains aggregate-only and privacy-safe
