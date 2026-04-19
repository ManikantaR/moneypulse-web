# MoneyPulse Web

Cloud-hosted companion app for MoneyPulse with strict data boundary:

- Source of truth remains local MoneyPulse server
- One-way sync local -> Firebase only
- No direct account numbers or PII in cloud data model
- Firebase Hosting + Firestore + Auth + Functions + FCM

## Core Principles

1. Security-first and least-privilege by default
2. Zero-PII cloud projection
3. Deterministic alias mapping for user/account/entity identity
4. Mobile-first, data-dense fintech UI
5. Signed, idempotent sync events
6. GitHub Actions deploys authenticated with Google OIDC Workload Identity Federation

## Repository Layout

- apps/web: Next.js app (Firebase Hosting target)
- functions: Firebase Cloud Functions (ingestion endpoint, push senders)
- specs: phased implementation specs
- docs: setup and operations guides

## Initial Scope

- Dashboard
- Transactions
- Categories
- AI insights (aggregate only)
- Budgets
- Alerts
- In-app notifications + web push (FCM)

## Data Boundary Contract

This repository must never contain:

- Local DB credentials
- Full account numbers or last four values
- Raw AI prompt/output text from local system
- Any reverse-sync endpoint to local MoneyPulse API
