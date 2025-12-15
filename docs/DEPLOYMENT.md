# Deployment Guide

## Overview

The EstateFox application uses GitHub Actions for CI/CD with separate workflows for development and production environments. The application consists of:
- **Frontend**: Expo web app deployed to AWS S3 + CloudFront
- **Backend**: FastAPI deployed to AWS Lambda via Docker/ECR

## Environments

### Production
- **Branch**: `main`
- **Frontend URL**: Configured via `CLOUDFRONT_DOMAIN` variable
- **Backend**: AWS Lambda function
- **Trigger**: Push to `main` branch or manual workflow dispatch

### Development/PR Preview
- **Branch**: Feature branches
- **Purpose**: Build validation and preview
- **Trigger**: Pull requests to `main`

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
**Trigger**: Push to `main` branch or manual dispatch

**Features**:
- Checks for AWS credentials before running
- Detects changes in frontend/backend directories
- Only deploys changed components
- Skips gracefully if AWS not configured

**Frontend Deployment**:
1. Build Expo web export
2. Sync to S3 bucket
3. Invalidate CloudFront cache

**Backend Deployment**:
1. Run tests
2. Build Docker image
3. Push to ECR
4. Update Lambda function

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

### AWS Authentication (Option 1 - Access Keys)
Configure these in GitHub Settings → Secrets and variables → Actions:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

### AWS Authentication (Option 2 - OIDC/IAM Role) ⭐ Recommended
More secure, no long-lived credentials:

```
AWS_ROLE_ARN - IAM role ARN with trust relationship to GitHub OIDC
```

### Frontend Deployment Secrets
```
S3_BUCKET_NAME or S3_BUCKET - S3 bucket for static assets
CLOUDFRONT_DISTRIBUTION_ID - CloudFront distribution ID
CLOUDFRONT_DOMAIN - Your CloudFront domain (e.g., d123456.cloudfront.net)
```

### Backend Deployment Secrets
```
ECR_REGISTRY - ECR registry URL (e.g., 123456789.dkr.ecr.us-east-1.amazonaws.com)
```

## Variables vs Secrets

Use **Secrets** for:
- Credentials and access keys
- Sensitive configuration

Use **Variables** for:
- Non-sensitive configuration (S3 bucket names, CloudFront IDs)
- Available in repository settings → Variables

## Manual Deployment

### Frontend (Local)
```bash
cd frontend
npm install
npm run build:web
# Upload dist/ to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Backend (Local)
```bash
cd backend
pip install -e ".[dev]"
pytest tests/
docker build -t estatefox-api .
# Push to ECR and update Lambda
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

1. Developer creates PR
2. CI workflow runs (tests both frontend and backend)
3. Web deploy workflow builds frontend
4. Bot comments on PR with build status
5. Reviewer can verify build succeeded
6. On merge, deploy workflow automatically deploys to production

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
