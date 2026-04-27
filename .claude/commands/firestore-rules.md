Review or update Firestore rules for MoneyPulse Web.

Firestore rules are security-sensitive. Treat every change as a security review.

**Before any rules change, answer:**

1. Which collections are **projected** (written by `ingestSyncEvent` only, browser read-only)?
2. Which collections are **overlays** (browser-writable, cloud-only personalization)?
3. Does the rule change accidentally allow browser writes to a projected collection?
4. Is the auth context check using `request.auth.uid == userAliasId` pattern?
5. What happens if `request.auth` is null — is the default deny preserved?

**Current rule structure to preserve:**
```
match /{document=**} { allow read, write: if false; }  // default deny — NEVER remove
match /users/{userAliasId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userAliasId;
}
```

**When adding a new collection, classify it first:**

Projected collection example:
```
match /transactions/{txnId} {
  allow read: if request.auth != null && resource.data.userAliasId == request.auth.uid;
  allow write: if false;  // function-only write
}
```

Overlay collection example:
```
match /users/{userAliasId}/preferences/{prefId} {
  allow read, write: if request.auth != null && request.auth.uid == userAliasId;
}
```

**After any rules change:**
- Run `pnpm build` to confirm rules compile
- Test in Firebase emulator: verify denied paths remain denied
- Update `firestore.rules` and update `specs/PHASE<N>-SPEC.md` with the collection inventory change
