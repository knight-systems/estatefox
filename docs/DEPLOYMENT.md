# Deployment Guide

## Environments

EstateFox uses a two-environment deployment strategy:

| Environment | Trigger | Approval | URL |
|-------------|---------|----------|-----|
| **dev** | Push to `main` | Auto | https://dev.estatefox.com |
| **production** | Push `v*` tag | Required reviewer | https://estatefox.com |

### Environment URLs

| Component | Dev | Production |
|-----------|-----|------------|
| **Frontend** | https://dev.estatefox.com | https://estatefox.com |
| **Backend API** | https://api-dev.estatefox.com | https://api.estatefox.com |
| **API Health** | https://api-dev.estatefox.com/health | https://api.estatefox.com/health |
| **API Docs** | https://api-dev.estatefox.com/docs | https://api.estatefox.com/docs |

---

## Deployment Workflow

### Automatic Dev Deployment

Every push to `main` automatically deploys to the dev environment:

```bash
git checkout main
git pull
# make changes
git commit -m "feat: my feature"
git push origin main
# → Automatically deploys to dev.estatefox.com
```

### Production Release

Production deployments require:
1. A version tag (`v1.x.x`)
2. Manual approval from a reviewer

**Using the release script (recommended):**

```bash
./scripts/release.sh
```

The script will:
1. Check you're on main and up-to-date
2. Show current version and commits since last release
3. Let you choose patch/minor/major version
4. Update package.json and pyproject.toml versions
5. Create annotated tag and push
6. GitHub Actions will create the release and wait for approval

**Manual release:**

```bash
git tag v1.2.3
git push origin v1.2.3
# → Go to GitHub Actions, approve the production deployment
```

### PR Previews

Pull requests get automatic preview deployments:

| Platform | Preview |
|----------|---------|
| **Web** | Netlify preview URL (posted as PR comment) |
| **Mobile (JS changes)** | EAS Update QR code |
| **Mobile (native changes)** | EAS Build link |

PR previews use the dev API (`api-dev.estatefox.com`).

---

## Rollback

To rollback production, re-deploy a previous tag:

```bash
# Option 1: Re-run workflow for a previous tag via GitHub UI
# Actions → Deploy → Re-run for tag v1.2.2

# Option 2: Via CLI
gh workflow run deploy-aws.yml --ref v1.2.2 -f environment=production -R knight-systems/estatefox

# Option 3: Direct Lambda rollback (fastest)
aws lambda update-function-code \
  --function-name estatefox-api \
  --image-uri 096908083292.dkr.ecr.us-east-1.amazonaws.com/estatefox-api:v1.2.2
```

**Important:** Never create new tags pointing to old commits. Tags are immutable release markers.

---

## AWS Resources

### Production Environment

| Resource | Name/ID |
|----------|---------|
| **S3 Bucket** | `agent-platform-site-estatefox` |
| **CloudFront Distribution** | `E13T5W68PJTIM3` |
| **ECR Repository** | `estatefox-api` |
| **Lambda Function** | `estatefox-api` |

### Dev Environment

| Resource | Name/ID |
|----------|---------|
| **S3 Bucket** | `agent-platform-site-estatefox-dev` |
| **CloudFront Distribution** | `E3BNN8E1D1WZI5` |
| **ECR Repository** | `estatefox-api-dev` |
| **Lambda Function** | `estatefox-api-dev` |

---

## GitHub Configuration

### Environments

GitHub Environments are configured with protection rules:

| Environment | Protection |
|-------------|------------|
| `dev` | None (auto-deploy) |
| `dev-api` | None (auto-deploy) |
| `production` | Required reviewer, tag restriction (`v*`) |
| `production-api` | Required reviewer, tag restriction (`v*`) |

### Secrets

Secrets are environment-scoped (same name, different values per environment):

| Secret | Scope | Purpose |
|--------|-------|---------|
| `AWS_ROLE_ARN` | Repository | IAM role for OIDC authentication |
| `ECR_REGISTRY` | Repository | ECR registry URL |
| `S3_BUCKET_NAME` | Environment | S3 bucket for frontend |
| `CLOUDFRONT_DISTRIBUTION_ID` | Environment | CloudFront for cache invalidation |
| `ECR_REPOSITORY` | Environment | Full ECR repository URL |
| `LAMBDA_FUNCTION_NAME` | Environment | Lambda function name |
| `API_URL` | Environment | Backend API URL for frontend config |

---

## Local Development

**Frontend:**
```bash
cd frontend
npm install
npm start  # Expo dev server
```

**Backend:**
```bash
cd backend
pip install -e ".[dev]"
uvicorn src.estatefox_api.main:app --reload
```

**Run all tests:**
```bash
npm test                 # All tests
npm run test:backend     # Backend only
npm run test:frontend    # Frontend only
```

---

## Troubleshooting

### OIDC Authentication Fails

**Error:** "Not authorized to perform sts:AssumeRoleWithWebIdentity"

**Solution:** The IAM trust policy needs to include the environment pattern. Check that it matches:
- `repo:knight-systems/estatefox:ref:refs/heads/main`
- `repo:knight-systems/estatefox:ref:refs/tags/v*`
- `repo:knight-systems/estatefox:environment:*`

### CloudFront Returns Old Content

1. Check invalidation was triggered in GitHub Actions logs
2. Wait 5-10 minutes for propagation
3. Hard refresh browser (Ctrl+Shift+R)

### Lambda Not Updating

Lambda now uses version-tagged images (not `:latest`). The deploy workflow explicitly updates the function code with the version tag.

To manually update:
```bash
aws lambda update-function-code \
  --function-name estatefox-api \
  --image-uri 096908083292.dkr.ecr.us-east-1.amazonaws.com/estatefox-api:v1.2.3
```

### Production Deploy Not Triggering

Production deploys only trigger for version tags (`v*`). Ensure:
1. Tag starts with `v` (e.g., `v1.0.0`, not `1.0.0`)
2. Tag is pushed to origin (`git push origin v1.0.0`)

---

## Architecture Diagram

```
                         GitHub Actions
    ┌────────────────────────────────────────────────────────┐
    │                                                        │
    │   Push to main          Push v* tag                    │
    │        │                     │                         │
    │        ▼                     ▼                         │
    │   ┌─────────┐          ┌─────────────┐                │
    │   │  Build  │          │   Build     │                │
    │   └────┬────┘          └──────┬──────┘                │
    │        │                      │                        │
    │        ▼                      ▼                        │
    │   ┌─────────┐          ┌─────────────┐                │
    │   │  Dev    │          │  Approval   │                │
    │   │ Deploy  │          │  Required   │                │
    │   └────┬────┘          └──────┬──────┘                │
    │        │                      │                        │
    └────────┼──────────────────────┼────────────────────────┘
             │                      │
             ▼                      ▼
    ┌─────────────────┐    ┌─────────────────┐
    │  Dev Environment │    │ Prod Environment │
    │                  │    │                  │
    │ dev.estatefox.com│    │ estatefox.com    │
    │ api-dev.esta...  │    │ api.estatefox... │
    └─────────────────┘    └─────────────────┘
```

---

## Infrastructure Management

Infrastructure is managed via Terraform in the `agent-platform` repository:
- `infra/terraform/main.tf` - Module definitions for both environments
- `infra/terraform/outputs.tf` - Output values for secrets provisioning
- `.github/workflows/provision-infra.yml` - Auto-pushes secrets to estatefox repo
