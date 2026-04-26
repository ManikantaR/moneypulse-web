# Phase 6 Spec - Hardening and Launch Readiness

> Status: Planned. This phase is the production gate. It turns the implementation from feature-complete to deployment-ready, abuse-tested, and operator-friendly.

## Goals

- Complete production security, reliability, and operating controls
- Validate abuse resistance for rules and signed ingress
- Produce the runbooks and checks needed for repeatable production deploys

## Decisions Summary

| Decision | Choice |
| --- | --- |
| Abuse coverage | rules + ingress + secrets + push |
| Runbook requirement | mandatory before launch |
| Rotation drills | test secret rollover, not just document it |
| Launch gate | zero critical findings and repeatable deploy |

## Deliverables

1. Abuse tests for rules and ingestion endpoint
2. End-to-end audit and traceability checks
3. Key rotation runbook and secret rollover drill
4. Incident response and rollback guide
5. SLO dashboard or explicit operational metrics for API latency and sync freshness

## File Inventory

| File Area | Purpose |
| --- | --- |
| future `functions/src/__tests__/*` | abuse and failure-path tests |
| future `docs/operations/*` | incident, rollback, and rotation runbooks |
| `.github/workflows/deploy.yml` | final production deploy assumptions |
| `docs/agentic/memory.md` | stable deploy facts agents should reuse |

## Hardening Scope

### Rules And Browser Abuse

- verify unauthenticated reads are denied
- verify cross-user reads and writes are denied
- verify projected collections remain read-only from browser clients

### Ingress Abuse

- invalid signature
- stale timestamp
- missing idempotency key
- replay attempt with reused key
- malformed body

### Secret And Deploy Hardening

- verify required GCP APIs are enabled
- verify required secrets exist
- verify deploy service account permissions are complete and least-privilege where possible
- document manual recovery steps for common deploy failures

## Validation

- rerun full CI successfully
- run production deploy from GitHub Actions successfully
- execute a secret rotation dry run or documented rehearsal
- verify logs and monitoring allow operators to trace ingress failures and stale sync conditions

## Exit Criteria

1. Zero critical security findings open
2. Rules and functions deployment fully automated except documented external prerequisites
3. Production checklist signed off
4. Rotation, rollback, and incident runbooks written and usable
