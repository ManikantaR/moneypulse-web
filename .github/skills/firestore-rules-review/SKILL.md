---
name: firestore-rules-review
description: Review or design Firestore rules for MoneyPulse Web with focus on alias-based isolation, least privilege, and the projected-versus-overlay boundary.
---

Review rules changes with these questions:

1. Which collections are projected and browser read-only?
2. Which collections are cloud-only overlays and who may write them?
3. Does auth context map cleanly to alias-based isolation?
4. Did the change accidentally broaden access for projected data?
5. What is the exact validation path for the rules change?