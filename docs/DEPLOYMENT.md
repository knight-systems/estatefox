# Deployment Guide

## Overview

The EstateFox application uses GitHub Actions for CI/CD with separate workflows for development, production, and PR preview environments. The application supports multiple deployment platforms:

- **Frontend**: Expo web app
  - AWS S3 + CloudFront
  - Netlify (with automatic PR previews)
  - GitHub Pages
- **Backend**: FastAPI deployed to AWS Lambda via Docker/ECR

## Environments

### Production
- **Branch**: `main`
- **Frontend URL**: `https://estatefox.com`
- **Backend URL**: `https://api.estatefox.com`
- **Trigger**: Push to `main` branch or manual workflow dispatch
- **Purpose**: Live production environment

### Development
- **Branch**: `dev`
- **Frontend URL**: `https://dev.estatefox.com`
- **Backend URL**: `https://api-dev.estatefox.com`
- **Trigger**: Push to `dev` branch or manual workflow dispatch
- **Purpose**: Development testing and validation

### PR Preview
- **Branch**: Feature branches
- **Frontend URL**: `https://preview-pr-{number}.estatefox.com` (or Netlify preview URL)
- **Backend URL**: `https://api-preview-pr-{number}.estatefox.com`
- **Trigger**: Pull requests to `main` or `dev`
- **Purpose**: Review changes before merging

## GitHub Actions Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)
**Trigger**: Pull requests and pushes to `main`

**Backend Steps**:
1. Setup Python 3.11
2. Install dependencies
3. Lint with ruff
4. Type check with mypy
5. Run pytest with coverage
6. Export OpenAPI spec
7. Upload OpenAPI spec as artifact

**Frontend Steps**:
1. Setup Node.js 18
2. Download OpenAPI spec from backend
3. Install dependencies
4. Generate API types from OpenAPI spec
5. Type check with TypeScript
6. Lint
7. Run Jest tests with coverage

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)
**Trigger**:
- Push to `main` branch (production)
- Push to `dev` branch (development)
- Pull requests to `main` or `dev` (PR previews)
- Manual workflow dispatch

**Features**:
- Automatically detects deployment environment based on branch/event
- Checks for deployment platform credentials (AWS/Netlify/GitHub Pages)
- Detects changes in frontend/backend directories
- Only deploys changed components
- Supports multiple deployment platforms
- Creates PR preview environments

**Environment Detection**:
- `main` branch → production environment
- `dev` branch → dev environment
- Pull requests → preview environment
- Manual dispatch → choose environment

**Frontend Deployment Options**:

**AWS S3 + CloudFront**:
1. Build Expo web export with environment-specific API URL
2. Upload build artifact
3. Sync to S3 bucket (prod or dev)
4. Invalidate CloudFront cache
5. Uses separate buckets for prod/dev

**Netlify**:
1. Build Expo web export
2. Upload build artifact
3. Deploy to Netlify site (prod or dev)
4. Automatic PR preview deployment
5. Comments PR with preview URL

**GitHub Pages**:
1. Build Expo web export
2. Upload build artifact
3. Deploy to GitHub Pages (production only)
4. Available as fallback if AWS/Netlify not configured

**Backend Deployment**:
1. Run tests with coverage
2. Build Docker image (tagged with environment)
3. Save and upload Docker image artifact
4. Push to ECR with environment tag
5. Update Lambda function (separate functions for prod/dev)
6. Wait for Lambda update to complete

### 3. Frontend Web Deploy (`.github/workflows/deploy-web.yml`)
**Trigger**: Push to `main` or pull requests

**Features**:
- Builds web export for all PRs
- Deploys to S3 only on `main`
- Comments deployment status on PRs
- Uses OIDC for AWS authentication (more secure)

**Cache Strategy**:
- Static assets: `max-age=31536000, immutable`
- HTML/JSON: `max-age=0, must-revalidate`

## Required Secrets

Choose ONE deployment platform based on your needs. Configure the corresponding secrets in GitHub Settings → Secrets and variables → Actions.

### Option 1: AWS Deployment (Full Control)

**AWS Authentication**:
```
AWS_ACCESS_KEY_ID              # AWS access key
AWS_SECRET_ACCESS_KEY          # AWS secret key
```

**Frontend Secrets** (separate for prod/dev):
```
S3_BUCKET_NAME_PROD            # Production S3 bucket name
S3_BUCKET_NAME_DEV             # Dev S3 bucket name
CLOUDFRONT_DISTRIBUTION_ID_PROD # Production CloudFront distribution ID
CLOUDFRONT_DISTRIBUTION_ID_DEV  # Dev CloudFront distribution ID
```

**Backend Secrets**:
```
ECR_REGISTRY                   # ECR registry URL (e.g., 123456789.dkr.ecr.us-east-1.amazonaws.com)
```

**Note**: Lambda functions should be named `estatefox-api-production` and `estatefox-api-dev`

### Option 2: Netlify Deployment (Easy Setup)

**Netlify Authentication**:
```
NETLIFY_AUTH_TOKEN             # Netlify personal access token
NETLIFY_SITE_ID_PROD           # Production site ID
NETLIFY_SITE_ID_DEV            # Dev site ID
```

**How to get Netlify secrets**:
1. Go to https://app.netlify.com/user/applications
2. Create a new personal access token
3. Create two sites (one for production, one for dev)
4. Copy the site IDs from Settings > General > Site details

**Benefits**:
- Automatic PR preview deployments
- PR comments with preview URLs
- No infrastructure setup needed
- Built-in CDN

### Option 3: GitHub Pages (Simple Static Hosting)

**No secrets required!**

1. Go to repository Settings > Pages
2. Under "Source", select "GitHub Actions"
3. Push to `main` to deploy

**Note**: GitHub Pages only supports production deployments (no dev or PR previews)

### Combining Platforms

You can use different platforms for different purposes:
- **Frontend**: Netlify (easy PR previews)
- **Backend**: AWS Lambda (full control)

The workflow automatically detects which platforms are configured based on available secrets.

## Variables vs Secrets

Use **Secrets** for:
- Credentials and access keys
- Sensitive configuration

Use **Variables** for:
- Non-sensitive configuration (S3 bucket names, CloudFront IDs)
- Available in repository settings → Variables

## Deployment Workflows

### Development Workflow

1. **Create feature branch**:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/my-feature
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-feature
   ```

3. **Open PR to dev branch**:
   - PR preview automatically created (if Netlify configured)
   - CI tests run automatically
   - Review preview deployment

4. **Merge to dev**:
   - Automatically deploys to dev environment
   - Test at `https://dev.estatefox.com`

5. **When ready for production**:
   - Create PR from `dev` to `main`
   - Review and merge
   - Automatically deploys to production

### Production Hotfix Workflow

For urgent fixes that can't wait for normal dev cycle:

1. **Create hotfix branch from main**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug
   ```

2. **Fix and test locally**

3. **Open PR to main**:
   - PR preview created
   - Fast-track review

4. **Merge to main**:
   - Automatically deploys to production

5. **Backport to dev**:
   ```bash
   git checkout dev
   git merge main
   git push origin dev
   ```

### Manual Deployment

You can manually trigger deployments from GitHub Actions:

1. Go to **Actions** tab
2. Select **Deploy** workflow
3. Click **Run workflow**
4. Choose environment: `dev` or `production`
5. Click **Run workflow**

### Local Build (Testing Only)

**Frontend**:
```bash
cd frontend
npm install
npm run build:web
# Output in dist/ directory
```

**Backend**:
```bash
cd backend
pip install -e ".[dev]"
pytest tests/
docker build -t estatefox-api .
```

## Deployment Verification

### Frontend Checks
1. ✅ Build completes successfully
2. ✅ Files uploaded to S3
3. ✅ CloudFront invalidation triggered
4. ✅ Site accessible at CloudFront URL
5. ✅ Assets load correctly
6. ✅ Favicon and logos display

### Backend Checks
1. ✅ Tests pass
2. ✅ Docker image builds
3. ✅ Image pushed to ECR
4. ✅ Lambda function updated
5. ✅ API responds at endpoint
6. ✅ Health check returns 200

## Troubleshooting

### Deployment Skipped
**Issue**: Workflow shows "AWS credentials not configured"
**Solution**: Add AWS secrets as described above

### S3 Upload Fails
**Issue**: Access denied errors
**Solution**: Check IAM permissions include `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`

### CloudFront Not Updating
**Issue**: Old content still visible
**Solution**:
1. Check invalidation was created
2. Wait 5-10 minutes for propagation
3. Try hard refresh (Ctrl+Shift+R)

### Lambda Update Fails
**Issue**: Function code not updating
**Solution**:
1. Check ECR permissions
2. Verify Lambda has permission to pull from ECR
3. Check Lambda function name matches workflow

## AWS Infrastructure Setup

### Required AWS Resources

**Frontend**:
- S3 bucket (static website hosting enabled)
- CloudFront distribution (origin: S3 bucket)
- Route53 (optional, for custom domain)

**Backend**:
- ECR repository
- Lambda function (container image)
- API Gateway (optional, for custom domain/CORS)
- Lambda execution role with CloudWatch Logs permissions

### IAM Permissions

**For GitHub Actions (IAM User or Role)**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:UpdateFunctionCode"
      ],
      "Resource": "arn:aws:lambda:REGION:ACCOUNT_ID:function:estatefox-api"
    }
  ]
}
```

## PR Preview Workflow

### With Netlify (Recommended)

1. Developer creates PR to `main` or `dev`
2. CI workflow runs (tests both frontend and backend)
3. Deploy workflow builds frontend and backend
4. Netlify creates preview deployment
5. Bot comments on PR with preview URL
6. Reviewer can:
   - View live preview
   - Test functionality
   - Verify visual changes
7. Preview updates automatically on new commits
8. On merge, deploys to target environment (dev or production)

### With AWS (Manual Preview)

1. Developer creates PR
2. CI workflow runs tests
3. Build artifacts created
4. Reviewer checks build status
5. Manual testing may be required
6. On merge, deploys to target environment

## Deployment Summary

After each deployment, GitHub Actions creates a summary showing:

- **Environment**: Which environment was deployed to
- **URL**: The deployment URL
- **Commit**: The commit SHA that was deployed
- **Services**: Which services were deployed (frontend/backend)
- **Status**: Success/failure for each service

View summaries in the Actions tab → Deploy workflow → Summary

## Rollback Procedure

### Frontend Rollback
1. Identify previous working commit
2. Manually deploy:
   ```bash
   git checkout <commit-hash>
   cd frontend && npm run build:web
   aws s3 sync dist/ s3://your-bucket-name/
   aws cloudfront create-invalidation --distribution-id ID --paths "/*"
   ```

### Backend Rollback
1. Find previous ECR image tag
2. Update Lambda:
   ```bash
   aws lambda update-function-code \
     --function-name estatefox-api \
     --image-uri <ecr-registry>/estatefox-api:<previous-tag>
   ```

## Performance Optimization

### Frontend
- ✅ Long cache for static assets (1 year)
- ✅ Short cache for HTML/JSON (immediate revalidation)
- ✅ CloudFront for global CDN
- ✅ Asset optimization in build process

### Backend
- Lambda cold start optimization
- API response caching (if needed)
- Container image size optimization

## Monitoring

### Frontend
- CloudFront metrics in AWS Console
- Real User Monitoring (RUM) - configure if needed
- CloudWatch Logs for Lambda@Edge (if used)

### Backend
- Lambda metrics (invocations, duration, errors)
- CloudWatch Logs
- API Gateway metrics (if used)
- X-Ray tracing (configure if needed)

## Cost Optimization

### Frontend
- S3: Pay per GB stored and transferred
- CloudFront: Pay per GB transferred and requests
- **Estimate**: ~$1-5/month for low traffic

### Backend
- Lambda: Free tier includes 1M requests/month
- ECR: Pay per GB stored
- **Estimate**: ~$0-5/month for low traffic

## Next Steps

1. Configure AWS resources (S3, CloudFront, ECR, Lambda)
2. Add secrets to GitHub repository
3. Push to `main` to trigger first deployment
4. Verify deployment
5. Configure custom domain (optional)
6. Set up monitoring alerts (optional)
