# Phase 3 Spec - Categories, Budgets, Alerts

> Status: Planned. This phase extends the read model from transaction visibility to spending control surfaces while keeping projected and overlay state cleanly separated.

## Goals

- Expose category and budget views from projected data
- Deliver cloud-only alert and preference overlays
- Preserve a strict boundary between read-only projection and browser-editable overlay state

## Decisions Summary

| Decision | Choice |
| --- | --- |
| Category source | projected from local MoneyPulse |
| Budget source | projected totals plus optional cloud-only presentation overlays |
| Alert center | browser-readable, overlay-managed state |
| Overlay writes | never mutate projected transaction records |

## Deliverables

1. Category tree with spend totals
2. Budget progress cards and threshold states
3. Alert center with unread handling
4. Overlay preferences such as pins and saved filters stored cloud-only

## File Inventory

| File Area | Purpose |
| --- | --- |
| future `apps/web/src/app/(dashboard)/categories/page.tsx` | categories screen |
| future `apps/web/src/app/(dashboard)/budgets/page.tsx` | budgets screen |
| future `apps/web/src/app/(dashboard)/alerts/page.tsx` | alerts center |
| future `apps/web/src/components/categories/*` | category tree and totals |
| future `apps/web/src/components/budgets/*` | budget cards and threshold states |
| future `apps/web/src/components/alerts/*` | inbox rows and unread controls |
| `firestore.rules` | separate projected collections from overlay writes |

## Data Boundary

### Projected Collections

- category totals
- budget totals and threshold status
- alert events projected from local logic if applicable

### Overlay Collections

- pinning
- saved filters
- unread/read state
- notification preferences safe for cloud ownership

Overlay data may be writable by the authenticated user alias. Projected data stays read-only.

## Security Requirements

1. Overlay writes cannot mutate projected transaction, category, or budget records
2. Rules enforce projected collections write-protected from browser clients
3. Alert data shown to a user must remain household and alias scoped

## Validation

- verify category and budget screens load from projected data only
- verify alert center unread or preference writes land only in overlay collections
- verify a browser client cannot update projected category or budget docs
- verify cross-user overlay access is denied by rules

## Exit Criteria

- categories screen renders totals and hierarchy safely
- budgets screen renders progress and threshold states
- alert center supports read-state handling without mutating projected data
- rules clearly separate read-only projection from writable overlays
