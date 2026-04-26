# MoneyPulse Web Rule Set

## Always Rules

1. Start with the relevant phase spec and confirm the current implementation surface.
2. Protect the de-identified cloud boundary. No PII, no reverse sync, no raw local AI traces.
3. Prefer the smallest vertical slice that can be validated end-to-end.
4. Keep security-sensitive work explicit: auth, rules, secrets, signatures, idempotency, and notifications.
5. Document validation commands and any manual prerequisites every time.

## Decision Tree Checkpoints

### Before planning

- Is this a product/spec task, an implementation task, a security task, or an ops task?
- Which phase spec owns the change?
- Which repo surfaces are authoritative right now?

### Before editing

- Which files directly control behavior?
- What is the smallest safe slice?
- What validations can falsify the plan quickly?

### Before completing

- Did the change preserve the data-boundary contract?
- Did you update the spec, prompt, or ops doc if behavior changed?
- Did you document manual follow-up if automation cannot complete the loop?

## Rubber-Duck Review

Run this checklist for every plan, spec, fix, and implementation:

1. State the problem in one sentence.
2. State the smallest change that solves it.
3. State the security consequence if the change is wrong.
4. State the validation that would prove the change worked.
5. State the next likely failure mode after success.

If any answer is fuzzy, keep working before handing off.