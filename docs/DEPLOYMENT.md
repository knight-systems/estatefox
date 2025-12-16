# Deployment Guide

## Current Infrastructure

EstateFox is deployed to AWS using GitHub Actions with OIDC authentication (no access keys).

### Live URLs

| Component | URL |
|-----------|-----|
| **Frontend** | https://d1m6idbq3389wk.cloudfront.net |
| **Backend API** | https://4alsrxieg1.execute-api.us-east-1.amazonaws.com |
| **API Health** | https://4alsrxieg1.execute-api.us-east-1.amazonaws.com/health |
| **API Docs** | https://4alsrxieg1.execute-api.us-east-1.amazonaws.com/docs |

### AWS Resources

| Resource | Name/ID |
|----------|---------|
| **S3 Bucket** | `agent-platform-site-estatefox` |
| **CloudFront Distribution** | `E13T5W68PJTIM3` |
| **ECR Repository** | `096908083292.dkr.ecr.us-east-1.amazonaws.com/estatefox-api` |
| **Lambda Function** | `estatefox-api` |
| **API Gateway** | `4alsrxieg1` |
| **IAM Role (OIDC)** | `github-actions-terraform` |

### GitHub Secrets

These secrets are configured in the repository:

| Secret | Purpose |
|--------|---------|
| `AWS_ROLE_ARN` | IAM role ARN for OIDC authentication |
| `S3_BUCKET_NAME_PROD` | S3 bucket for frontend assets |
| `CLOUDFRONT_DISTRIBUTION_ID_PROD` | CloudFront distribution for cache invalidation |
| `ECR_REGISTRY` | ECR registry URL |
| `ECR_REPOSITORY` | Full ECR repository URL |
| `LAMBDA_FUNCTION_NAME` | Lambda function name for backend |
| `API_URL` | Backend API URL for frontend config |

### Deployment Workflow

The deployment uses `.github/workflows/deploy-aws.yml`:

1. **Authentication**: Uses AWS OIDC (role-to-assume) - no static credentials
2. **Frontend**: Builds Expo web export → Syncs to S3 → Invalidates CloudFront
3. **Backend**: Builds Docker image → Pushes to ECR → (Lambda auto-updates via ECR)

### Triggering Deployments

```bash
# Push to main (auto-deploys)
git push origin main

# Manual deployment
gh workflow run deploy-aws.yml -f environment=production
```

### Infrastructure Management

Infrastructure is managed via Terraform in the `agent-platform` repository:
- `infra/terraform/main.tf` - Module definitions
- `infra/terraform/outputs.tf` - Output values for secrets

---

## Development Guide

### Local Development

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

### Running Tests

```bash
# All tests
npm test

# Backend only
npm run test:backend

# Frontend only
npm run test:frontend
```

---

## Domain Configuration (Future)

Custom domain setup is not yet configured. When ready:

1. Request ACM certificate for `estatefox.com` and `*.estatefox.com`
2. Add DNS validation records in GoDaddy
3. Update CloudFront distribution with custom domain
4. Configure DNS CNAME records pointing to CloudFront

See the detailed domain setup instructions below.

---

## Detailed Domain Setup (GoDaddy to AWS)

### Step 1: Create SSL Certificate in AWS Certificate Manager

1. Open ACM in AWS Console (**must be us-east-1 region** for CloudFront)
2. Request a public certificate for:
   - `estatefox.com`
   - `*.estatefox.com`
3. Choose DNS validation
4. Note the CNAME records for validation

### Step 2: Add DNS Validation Records in GoDaddy

1. Log in to GoDaddy → DNS Management for estatefox.com
2. Add CNAME records from ACM:
   ```
   Name: _abc123 (without .estatefox.com)
   Value: _xyz456.acm-validations.aws.
   ```
3. Wait for certificate to be issued (5-30 minutes)

### Step 3: Configure CloudFront Custom Domain

1. Open CloudFront → Edit distribution `E13T5W68PJTIM3`
2. Add alternate domain names:
   - `estatefox.com`
   - `www.estatefox.com`
3. Select the ACM certificate
4. Save changes

### Step 4: Configure DNS in GoDaddy

```
# WWW subdomain
Type: CNAME
Name: www
Value: d1m6idbq3389wk.cloudfront.net

# Apex domain (use forwarding)
Forward estatefox.com → https://www.estatefox.com (301 redirect)

# API subdomain
Type: CNAME
Name: api
Value: 4alsrxieg1.execute-api.us-east-1.amazonaws.com
```

### Step 5: Verify

```bash
curl -I https://www.estatefox.com
curl -I https://api.estatefox.com/health
```

---

## Troubleshooting

### OIDC Authentication Fails

**Error:** "Not authorized to perform sts:AssumeRoleWithWebIdentity"

**Solution:** The IAM trust policy may need updating. Check that the OIDC subject pattern matches:
- `repo:knight-systems/estatefox:ref:refs/heads/main` (push to main)
- `repo:knight-systems/estatefox:environment:*` (workflow_dispatch)

### CloudFront Returns Old Content

**Solution:**
1. Check invalidation was triggered
2. Wait 5-10 minutes for propagation
3. Hard refresh browser (Ctrl+Shift+R)

### Lambda Not Updating

The Lambda function uses ECR image with `:latest` tag. On deploy:
1. New image is pushed to ECR
2. Lambda automatically picks up `:latest` on next cold start

To force immediate update:
```bash
aws lambda update-function-code \
  --function-name estatefox-api \
  --image-uri 096908083292.dkr.ecr.us-east-1.amazonaws.com/estatefox-api:latest
```

---

## Architecture Diagram

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                    GitHub Actions                        │
                    │  ┌─────────────┐    ┌─────────────┐                     │
                    │  │ Build       │    │ Build       │                     │
                    │  │ Frontend    │    │ Backend     │                     │
                    │  └──────┬──────┘    └──────┬──────┘                     │
                    │         │                  │                            │
                    │         ▼                  ▼                            │
                    │    ┌─────────┐       ┌─────────┐                        │
                    │    │ S3 Sync │       │ ECR Push│                        │
                    │    └────┬────┘       └────┬────┘                        │
                    └─────────┼─────────────────┼────────────────────────────┘
                              │                 │
                              ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS                                             │
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐  │
│  │ S3 Bucket        │    │ ECR Repository   │    │ Lambda Function      │  │
│  │ (Static Assets)  │◄───│ (Docker Images)  │───►│ (FastAPI Backend)    │  │
│  └────────┬─────────┘    └──────────────────┘    └──────────┬───────────┘  │
│           │                                                  │              │
│           ▼                                                  ▼              │
│  ┌──────────────────┐                            ┌──────────────────────┐  │
│  │ CloudFront CDN   │                            │ API Gateway          │  │
│  │ d1m6idbq3389wk   │                            │ 4alsrxieg1           │  │
│  └────────┬─────────┘                            └──────────┬───────────┘  │
│           │                                                  │              │
└───────────┼──────────────────────────────────────────────────┼──────────────┘
            │                                                  │
            ▼                                                  ▼
    ┌───────────────┐                                  ┌───────────────┐
    │ Frontend URL  │                                  │ Backend URL   │
    │ d1m6idb...net │                                  │ 4alsrxi...com │
    └───────────────┘                                  └───────────────┘
```
