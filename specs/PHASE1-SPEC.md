# Phase 1 Spec - Auth and Tenant Boundary

## Goals

- Implement Firebase Auth for single-household usage.
- Enforce strict user-alias data isolation in Firestore rules.

## Deliverables

1. Auth pages: login, register, reset password.
2. Session bootstrap with user alias profile document.
3. Firestore rules for user-scoped reads and writes.
4. App Check verification on protected endpoints.

## Security Requirements

1. No anonymous auth in production.
2. Password policy enabled.
3. Optional MFA flow enabled behind feature flag.
4. Access denied if alias profile missing.
