# Phase 4 Spec - AI Insights (Aggregate Only)

## Goals

- Provide AI observability without exposing sensitive prompts.

## Deliverables

1. Aggregate cards: total runs, avg latency, category coverage.
2. Trend chart for pii detection rate and model health.
3. Time filters and export of aggregate metrics.

## Security Requirements

1. No prompt text, output text, or merchant raw strings.
2. Aggregates must satisfy minimum cohort size before display.
