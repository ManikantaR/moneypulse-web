# GitHub Actions Workload Identity Federation Setup

Use this guide to configure GitHub Actions deployment to Firebase without storing a service-account JSON key in GitHub.

## Why this is the preferred setup

- No long-lived private key stored in GitHub secrets
- Easier rotation and lower secret-management overhead
- Repository-level trust can be limited to `ManikantaR/moneypulse-web`
- Better fit for a public repository where deployment credentials need the tightest possible scope

## Values you need first

- Google Cloud project ID
- Google Cloud project number
- Firebase project already created
- `gcloud` CLI authenticated as a project admin

## 1. Create a deploy service account

```bash
gcloud iam service-accounts create github-actions-deploy \
  --project="<project-id>" \
  --display-name="GitHub Actions Deploy"
```

Recommended roles for the service account:

- `roles/firebase.admin`
- `roles/cloudfunctions.admin`
- `roles/cloudbuild.builds.editor`
- `roles/artifactregistry.writer`
- `roles/iam.serviceAccountUser` when required by your deploy path

## 2. Create a Workload Identity Pool and Provider

```bash
gcloud iam workload-identity-pools create github \
  --project="<project-id>" \
  --location="global" \
  --display-name="GitHub Actions Pool"

gcloud iam workload-identity-pools providers create-oidc github-oidc \
  --project="<project-id>" \
  --location="global" \
  --workload-identity-pool="github" \
  --display-name="GitHub OIDC Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref"
```

## 3. Limit trust to this repository

Bind only this repository to the service account:

```bash
gcloud iam service-accounts add-iam-policy-binding \
  "github-actions-deploy@<project-id>.iam.gserviceaccount.com" \
  --project="<project-id>" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/<project-number>/locations/global/workloadIdentityPools/github/attribute.repository/ManikantaR/moneypulse-web"
```

## 4. Add GitHub repository secrets

In GitHub repository settings, add:

- `FIREBASE_PROJECT_ID`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT_EMAIL`

Values:

```text
FIREBASE_PROJECT_ID=<project-id>
GCP_WORKLOAD_IDENTITY_PROVIDER=projects/<project-number>/locations/global/workloadIdentityPools/github/providers/github-oidc
GCP_SERVICE_ACCOUNT_EMAIL=github-actions-deploy@<project-id>.iam.gserviceaccount.com
```

## 5. Verify workflow compatibility

The deploy workflow already expects:

- `id-token: write` GitHub Actions permission
- `google-github-actions/auth@v2`
- The two WIF-related secrets above plus `FIREBASE_PROJECT_ID`

## 6. Post-setup check

Push a harmless change to `main` or run the deploy workflow manually and verify:

- GitHub auth step succeeds
- Firebase CLI can deploy without a JSON key file
- Only this repository can assume the deployment identity