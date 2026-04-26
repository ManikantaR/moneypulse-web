---
name: firebase-deploy-readiness
description: Check MoneyPulse Web Firebase deploy readiness, including APIs, secrets, IAM, workflow assumptions, and manual prerequisites.
---

Before a deploy change or release:

- verify required APIs are enabled
- verify secrets exist and are readable by the deploy service account
- verify `firebase.json` runtime and targets match the workflow
- verify GitHub secrets use project ID, not project number, where required
- document any manual prerequisite and the exact rerun step

Report missing prerequisites explicitly instead of assuming the deploy can self-heal.