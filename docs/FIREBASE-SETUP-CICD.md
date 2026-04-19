# Firebase Setup and CI/CD Guide (Step-by-Step)

This guide assumes zero prior Firebase experience.

## 0. Create GitHub Repository

1. Open github.com and sign in.
2. Click New Repository.
3. Repository name: moneypulse-web.
4. Select Public or Private. Public is fine here because this repo is designed to exclude personal financial data, secrets, and reverse-sync capabilities.
5. Create repository.
6. From local machine, run:

```bash
cd /Users/manikantaradhakrishna/repo/moneypulse-web
git init
git add .
git commit -m "chore: initialize moneypulse-web scaffold"
git branch -M main
git remote add origin git@github.com:<your-username>/moneypulse-web.git
git push -u origin main
```

## 1. Create Accounts and Install Tools

1. Create or sign in to Google account.
2. Go to Firebase Console and create a new project named moneypulse-web.
3. Upgrade to Blaze plan (needed for production features and Functions flexibility).
4. Install Node 22 and pnpm.
5. Install Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
```

## 2. Initialize Firebase in Repo

From repository root:

```bash
firebase init hosting firestore functions
```

Pick:

- Existing project: moneypulse-web
- Firestore rules file: firestore.rules
- Firestore indexes file: firestore.indexes.json
- Functions language: TypeScript
- Hosting public or framework mode: framework-aware (Next.js)

## 3. Enable Core Firebase Services

In Firebase Console:

1. Authentication:
- Enable Email/Password provider
- Configure password policy
- Enable MFA policy (optional in MVP, prepare for phase 1)

2. Firestore:
- Create database in production mode
- Region: us-east4

3. Cloud Messaging:
- Enable FCM API

4. App Check:
- Add web app provider with reCAPTCHA Enterprise
- Start in monitor mode, then enforce in production

## 4. Create Service Accounts and Secrets

Preferred path: Workload Identity Federation. This avoids storing long-lived JSON credentials in GitHub and is the setup you should keep long-term.

### 4.1 Recommended: Workload Identity Federation

1. In Google Cloud IAM, create a deployment service account for GitHub Actions.
2. Grant minimum roles:
- Firebase Admin
- Cloud Functions Admin
- Service Account User
- Cloud Build Editor
- Artifact Registry Writer
3. Create a Workload Identity Pool and GitHub OIDC provider in Google Cloud.
4. Bind the GitHub repository to the service account using attribute conditions limited to this repository.
5. Store these values in GitHub repository secrets:
- FIREBASE_PROJECT_ID
- GCP_WORKLOAD_IDENTITY_PROVIDER
- GCP_SERVICE_ACCOUNT_EMAIL
- FIREBASE_WEB_APP_ID
- FIREBASE_VAPID_PUBLIC_KEY

Example `GCP_WORKLOAD_IDENTITY_PROVIDER` format:

```text
projects/123456789/locations/global/workloadIdentityPools/github/providers/github-oidc
```

Recommended GitHub attribute condition:

```text
assertion.repository == 'ManikantaR/moneypulse-web'
```

### 4.2 Fallback only: JSON key auth

Use this only if you need a temporary unblock. It is not the preferred steady-state setup.

1. Create a JSON key for the deploy service account.
2. Store it in a GitHub secret such as `FIREBASE_SERVICE_ACCOUNT`.
3. Replace the auth step in the deploy workflow with key-file based auth.

## 5. Configure GitHub Actions

Create two workflows:

1. ci.yml on pull requests:
- Install dependencies
- Lint
- Typecheck
- Unit tests
- Firestore rules unit tests

2. deploy.yml on main:
- Build web app
- Deploy functions
- Deploy firestore rules and indexes
- Deploy hosting
- Authenticate with Google via OIDC Workload Identity Federation

### Example ci.yml

Create .github/workflows/ci.yml:

```yaml
name: CI

on:
	pull_request:
		branches: [main]

jobs:
	validate:
		runs-on: ubuntu-latest
		steps:
			- name: Checkout
				uses: actions/checkout@v4

			- name: Setup Node
				uses: actions/setup-node@v4
				with:
					node-version: '22'

			- name: Setup pnpm
				uses: pnpm/action-setup@v4
				with:
					version: 10

			- name: Install
				run: pnpm install --frozen-lockfile

			- name: Lint
				run: pnpm lint

			- name: Test
				run: pnpm test

			- name: Build
				run: pnpm build
```

### Example deploy.yml

Create .github/workflows/deploy.yml:

```yaml
name: Deploy

on:
	push:
		branches: [main]

permissions:
	contents: read
	id-token: write

jobs:
	deploy:
		runs-on: ubuntu-latest
		steps:
			- name: Checkout
				uses: actions/checkout@v4

			- name: Setup Node
				uses: actions/setup-node@v4
				with:
					node-version: '22'

			- name: Setup pnpm
				uses: pnpm/action-setup@v4
				with:
					version: 10

			- name: Install
				run: pnpm install --frozen-lockfile

			- name: Build
				run: pnpm build

			- name: Setup Firebase CLI
				run: npm install -g firebase-tools

			- name: Authenticate to Google Cloud
				uses: google-github-actions/auth@v2
				with:
					workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
					service_account: ${{ secrets.GCP_SERVICE_ACCOUNT_EMAIL }}

			- name: Deploy to Firebase
				env:
					FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
				run: firebase deploy --project ${{ secrets.FIREBASE_PROJECT_ID }}
```

## 6. Add Safe Deployment Gates

1. Require at least one code review.
2. Require ci.yml success before merge.
3. Protect main from force pushes.
4. Require manual approval for production environment in GitHub Environments.

## 6.1 First Deployment Checklist

1. Confirm Firebase project id matches .firebaserc.
2. Confirm service account has deploy roles.
3. Confirm FIREBASE_SERVICE_ACCOUNT secret contains valid JSON key.
4. Run workflow manually using Actions tab if needed.
5. Verify deploy output includes Hosting, Functions, Firestore rules, and indexes.

If using Workload Identity Federation instead of JSON keys:

1. Confirm `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_SERVICE_ACCOUNT_EMAIL` are set.
2. Confirm the provider attribute condition restricts access to this repository.
3. Confirm GitHub environment protection is enabled for production.

## 6.2 End-to-End WIF Setup Commands

These are example commands. Replace placeholder values first.

```bash
export PROJECT_ID="your-gcp-project-id"
export PROJECT_NUMBER="your-gcp-project-number"
export POOL_ID="github"
export PROVIDER_ID="github-oidc"
export SERVICE_ACCOUNT_NAME="github-actions-deploy"
export REPO="ManikantaR/moneypulse-web"

gcloud iam workload-identity-pools create "$POOL_ID" \
	--project="$PROJECT_ID" \
	--location="global" \
	--display-name="GitHub Actions Pool"

gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
	--project="$PROJECT_ID" \
	--location="global" \
	--workload-identity-pool="$POOL_ID" \
	--display-name="GitHub OIDC Provider" \
	--issuer-uri="https://token.actions.githubusercontent.com" \
	--attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref"

gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
	--project="$PROJECT_ID" \
	--display-name="GitHub Actions Deploy"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
	--member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
	--role="roles/firebase.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
	--member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
	--role="roles/cloudfunctions.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
	--member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
	--role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
	--member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
	--role="roles/artifactregistry.writer"

gcloud iam service-accounts add-iam-policy-binding \
	"${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
	--project="$PROJECT_ID" \
	--role="roles/iam.workloadIdentityUser" \
	--member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO}"
```

Then set GitHub repository secrets:

```text
FIREBASE_PROJECT_ID=<your project id>
GCP_WORKLOAD_IDENTITY_PROVIDER=projects/<project-number>/locations/global/workloadIdentityPools/github/providers/github-oidc
GCP_SERVICE_ACCOUNT_EMAIL=github-actions-deploy@<project-id>.iam.gserviceaccount.com
```

## 7. Validate Security Before First Launch

1. Verify unauthenticated read/write is denied.
2. Verify user can only access documents under their alias id.
3. Verify ingestion function rejects missing signature.
4. Verify replay attack rejection by timestamp/idempotency checks.
5. Verify App Check token enforcement in production mode.

## 8. Web Push Technical Stack

Recommended approach:

- Firebase Cloud Messaging for browser push delivery
- Service worker file for background message handling
- VAPID key pair for push subscription
- Token lifecycle management (register, refresh, revoke)

Best practices:

1. Ask for notification permission only after user intent action.
2. Store tokens per device and browser session metadata.
3. Remove invalid tokens after send failures.
4. Use topic-like segmentation through server-side targeting collections.
5. Keep payloads minimal and fetch detail in-app on open.
