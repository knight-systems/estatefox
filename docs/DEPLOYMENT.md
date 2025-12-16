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

## Domain Configuration (GoDaddy to Hosting Platform)

This section provides step-by-step instructions for connecting your estatefox.com domain from GoDaddy to your chosen hosting platform.

### Prerequisites

1. Access to your GoDaddy account with domain management permissions
2. The domain estatefox.com registered in GoDaddy
3. Your hosting platform configured and deployed (AWS, Netlify, or GitHub Pages)

### Option 1: Connect GoDaddy to AWS (CloudFront + S3)

This is the recommended option for full control and best performance with CloudFront CDN.

#### Step 1: Create SSL Certificate in AWS Certificate Manager (ACM)

1. **Open AWS Certificate Manager** in the AWS Console
   - **IMPORTANT**: Switch to **us-east-1 (N. Virginia)** region (required for CloudFront)

2. **Request a certificate**:
   ```
   - Click "Request a certificate"
   - Choose "Request a public certificate"
   - Domain names:
     * estatefox.com
     * *.estatefox.com (for subdomains like www, api, dev)
   - Validation method: DNS validation (recommended)
   - Click "Request"
   ```

3. **Note the CNAME records** ACM provides for validation
   - You'll see records like:
     ```
     Name: _abc123.estatefox.com
     Value: _xyz456.acm-validations.aws.
     ```

#### Step 2: Add DNS Validation Records in GoDaddy

1. **Log in to GoDaddy**:
   - Go to https://dcc.godaddy.com/domains
   - Click on your domain **estatefox.com**

2. **Access DNS Management**:
   - Click "DNS" or "Manage DNS"
   - Scroll to the "Records" section

3. **Add ACM validation records**:
   ```
   For each CNAME record from ACM:
   - Type: CNAME
   - Name: _abc123 (remove .estatefox.com from ACM's name)
   - Value: _xyz456.acm-validations.aws. (exactly as shown in ACM)
   - TTL: 1 Hour (default)
   - Click "Add Record" or "Save"
   ```

4. **Wait for validation** (usually 5-30 minutes):
   - Return to ACM console
   - Certificate status should change to "Issued"
   - Refresh the page to check

#### Step 3: Configure CloudFront Distribution for Custom Domain

1. **Open CloudFront** in AWS Console:
   - Find your distribution (created during setup)
   - Click the Distribution ID

2. **Edit Settings**:
   - Click "General" tab → "Edit"
   - **Alternate domain names (CNAMEs)**:
     ```
     estatefox.com
     www.estatefox.com
     ```
   - **Custom SSL certificate**: Select your certificate from dropdown
   - **Supported HTTP versions**: HTTP/2, HTTP/3
   - Click "Save changes"

3. **Note the CloudFront domain name**:
   - Example: `d123abc456def.cloudfront.net`
   - You'll need this for GoDaddy DNS

#### Step 4: Configure DNS Records in GoDaddy

1. **Return to GoDaddy DNS Management**:
   - https://dcc.godaddy.com/domains → estatefox.com → DNS

2. **Update or add the following records**:

   **For Production (estatefox.com)**:
   ```
   Type: CNAME
   Name: www
   Value: d123abc456def.cloudfront.net (your CloudFront domain)
   TTL: 1 Hour

   Type: A (Alias/Forward)
   Name: @ (root domain)
   Value: Forward to https://www.estatefox.com
   OR use GoDaddy's domain forwarding:
   - Go to "Forwarding" section
   - Click "Add Forwarding"
   - Forward estatefox.com to https://www.estatefox.com
   - Forward type: Permanent (301)
   ```

   **For Development (dev.estatefox.com)**:
   ```
   Type: CNAME
   Name: dev
   Value: <your-dev-cloudfront-distribution>.cloudfront.net
   TTL: 1 Hour
   ```

   **For API (api.estatefox.com)**:
   ```
   Type: CNAME
   Name: api
   Value: <your-api-gateway-domain>.execute-api.us-east-1.amazonaws.com
   OR: <your-lambda-function-url>
   TTL: 1 Hour
   ```

3. **Remove conflicting records**:
   - Delete any existing A or CNAME records for @ or www that conflict
   - Keep only the new records you just added

#### Step 5: Verify the Connection

1. **Wait for DNS propagation** (5 minutes to 48 hours, usually < 1 hour):
   ```bash
   # Check DNS propagation
   nslookup www.estatefox.com
   nslookup dev.estatefox.com

   # Or use online tools
   # https://www.whatsmydns.net/#CNAME/www.estatefox.com
   ```

2. **Test the website**:
   ```bash
   # Test HTTPS works
   curl -I https://www.estatefox.com
   curl -I https://estatefox.com
   curl -I https://dev.estatefox.com

   # Should return 200 OK and show CloudFront headers
   ```

3. **Verify SSL certificate**:
   - Open https://www.estatefox.com in browser
   - Click padlock icon → should show valid SSL
   - Certificate should be issued by Amazon

### Option 2: Connect GoDaddy to Netlify

Netlify provides the easiest setup with automatic SSL certificates.

#### Step 1: Set Up Custom Domain in Netlify

1. **Log in to Netlify**:
   - Go to https://app.netlify.com
   - Select your site (production site)

2. **Add custom domain**:
   ```
   - Go to "Site settings" → "Domain management"
   - Click "Add custom domain"
   - Enter: estatefox.com
   - Click "Verify" and "Add domain"
   - Netlify will detect you don't own it yet and guide you
   ```

3. **Add www subdomain**:
   ```
   - Click "Add domain alias"
   - Enter: www.estatefox.com
   - Click "Save"
   ```

4. **Note the Netlify DNS targets**:
   - Netlify will show you what DNS records to create
   - Example:
     ```
     apex.netlify.app
     ```

#### Step 2: Configure DNS in GoDaddy

1. **Option A: Use Netlify DNS (Recommended)**:

   **In Netlify**:
   ```
   - In "Domain management", click "Set up Netlify DNS"
   - Netlify will show you nameservers like:
     * dns1.p01.nsone.net
     * dns2.p01.nsone.net
     * dns3.p01.nsone.net
     * dns4.p01.nsone.net
   ```

   **In GoDaddy**:
   ```
   - Go to https://dcc.godaddy.com/domains
   - Click estatefox.com
   - Scroll to "Nameservers" section
   - Click "Change Nameservers"
   - Select "I'll use my own nameservers"
   - Enter the 4 Netlify nameservers
   - Click "Save"
   ```

   **Advantages**: Netlify manages all DNS, automatic SSL, easier setup

2. **Option B: Keep GoDaddy DNS (Manual DNS)**:

   **In GoDaddy DNS Management**:
   ```
   Add CNAME record:
   - Type: CNAME
   - Name: www
   - Value: <your-site-name>.netlify.app
   - TTL: 1 Hour

   Add A record (for root domain):
   - Type: A
   - Name: @
   - Value: 75.2.60.5 (Netlify's load balancer IP)
   - TTL: 1 Hour

   Add subdomain for dev:
   - Type: CNAME
   - Name: dev
   - Value: <your-dev-site-name>.netlify.app
   - TTL: 1 Hour
   ```

   **Note**: Check Netlify's current IP addresses at https://docs.netlify.com/domains-https/custom-domains/

#### Step 3: Enable HTTPS in Netlify

1. **Return to Netlify**:
   - Go to "Domain management" → "HTTPS"
   - Click "Verify DNS configuration"
   - Once verified, click "Provision certificate"
   - Wait 1-5 minutes for SSL certificate

2. **Enable Force HTTPS**:
   - Toggle "Force HTTPS" to ON
   - All HTTP traffic will redirect to HTTPS

#### Step 4: Verify the Connection

1. **Wait for DNS propagation** (5-60 minutes):
   ```bash
   nslookup www.estatefox.com
   nslookup estatefox.com
   ```

2. **Test the site**:
   - Open https://estatefox.com
   - Should redirect to https://www.estatefox.com (or vice versa)
   - SSL certificate should be valid
   - Check dev environment: https://dev.estatefox.com

### Option 3: Connect GoDaddy to GitHub Pages

GitHub Pages is the simplest option but only supports production (no dev environment or API).

#### Step 1: Configure Custom Domain in GitHub

1. **Go to your repository on GitHub**:
   - Settings → Pages

2. **Add custom domain**:
   ```
   - Under "Custom domain", enter: www.estatefox.com
   - Click "Save"
   - GitHub will create a CNAME file in your repo
   - Wait for DNS check to complete
   ```

3. **Enable HTTPS**:
   ```
   - Check "Enforce HTTPS" (after DNS is configured)
   ```

#### Step 2: Configure DNS in GoDaddy

1. **Log in to GoDaddy**:
   - Go to https://dcc.godaddy.com/domains
   - Click estatefox.com → DNS

2. **Add GitHub Pages DNS records**:

   ```
   Add CNAME for www:
   - Type: CNAME
   - Name: www
   - Value: <your-github-username>.github.io
   - TTL: 1 Hour

   Add A records for apex domain:
   - Type: A
   - Name: @
   - Value: 185.199.108.153
   - TTL: 1 Hour

   Repeat for all 4 GitHub Pages IPs:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
   ```

3. **Add AAAA records for IPv6** (optional but recommended):
   ```
   - Type: AAAA
   - Name: @
   - Value: 2606:50c0:8000::153
   - TTL: 1 Hour

   Repeat for all 4 IPv6 addresses:
   - 2606:50c0:8000::153
   - 2606:50c0:8001::153
   - 2606:50c0:8002::153
   - 2606:50c0:8003::153
   ```

#### Step 3: Verify DNS Configuration

1. **Wait for DNS propagation** (15-60 minutes):
   ```bash
   nslookup www.estatefox.com
   # Should show <username>.github.io

   nslookup estatefox.com
   # Should show GitHub's IPs
   ```

2. **Verify in GitHub**:
   - Return to Settings → Pages
   - Should show "DNS check successful"
   - Enable "Enforce HTTPS"

3. **Test the site**:
   - Open https://estatefox.com
   - Open https://www.estatefox.com
   - Both should work with valid SSL

### API Subdomain Configuration

For all options, configure the API subdomain (api.estatefox.com):

#### For AWS Lambda with Function URLs:

```
GoDaddy DNS:
- Type: CNAME
- Name: api
- Value: <function-url-id>.lambda-url.us-east-1.on.aws
- TTL: 1 Hour

Production:
- Name: api
- Value: <prod-function-url>

Development:
- Name: api-dev
- Value: <dev-function-url>
```

#### For AWS Lambda with API Gateway:

1. **Create custom domain in API Gateway**:
   - Go to API Gateway console
   - Custom domain names → Create
   - Domain name: api.estatefox.com
   - Certificate: Select your ACM certificate
   - Endpoint type: Regional
   - Create API mappings for your APIs

2. **Add DNS in GoDaddy**:
   ```
   - Type: CNAME
   - Name: api
   - Value: <api-gateway-custom-domain-target>
   - TTL: 1 Hour
   ```

### DNS Propagation and Testing

#### Check DNS Propagation:

```bash
# Local checks
dig estatefox.com
dig www.estatefox.com
dig dev.estatefox.com
dig api.estatefox.com

# Or use online tools
# https://www.whatsmydns.net
# https://dnschecker.org
```

#### Test endpoints:

```bash
# Frontend
curl -I https://estatefox.com
curl -I https://www.estatefox.com
curl -I https://dev.estatefox.com

# Backend
curl https://api.estatefox.com/health
curl https://api-dev.estatefox.com/health
```

#### Expected response headers:

**AWS/CloudFront**:
```
HTTP/2 200
x-amz-cf-id: ... (CloudFront)
x-cache: Hit from cloudfront
```

**Netlify**:
```
HTTP/2 200
x-nf-request-id: ... (Netlify)
server: Netlify
```

**GitHub Pages**:
```
HTTP/2 200
server: GitHub.com
```

### Common Issues and Troubleshooting

#### Issue: DNS not propagating

**Solution**:
- Wait longer (can take up to 48 hours)
- Try different DNS servers: `nslookup estatefox.com 8.8.8.8`
- Check for typos in DNS records
- Flush local DNS cache: `sudo dscacheutil -flushcache` (macOS)

#### Issue: SSL certificate error

**Solution**:
- Ensure DNS is fully propagated first
- In AWS: Verify certificate is in us-east-1 region
- In Netlify: Click "Renew certificate" if needed
- In GitHub Pages: Uncheck and recheck "Enforce HTTPS"

#### Issue: "Domain already in use" in Netlify

**Solution**:
- Check if domain is configured in another Netlify site
- Remove domain from old site first
- Verify domain ownership through DNS or email

#### Issue: CloudFront shows 403 Forbidden

**Solution**:
- Check S3 bucket has a public read policy
- Verify CloudFront origin is configured correctly
- Check that index.html exists in the S3 bucket
- Verify CloudFront has permission to access S3

#### Issue: CNAME records not allowed for apex domain in GoDaddy

**Solution**:
- Use GoDaddy's domain forwarding feature
- Forward @ (apex) to www subdomain
- Or use A records as specified above

### Security Best Practices

1. **Always use HTTPS**:
   - Enable "Force HTTPS" in Netlify
   - Enable "Enforce HTTPS" in GitHub Pages
   - Configure HTTPS redirect in CloudFront

2. **Use strong SSL/TLS**:
   - TLS 1.2 minimum
   - Modern cipher suites only

3. **Set security headers** (in CloudFront, Netlify, or Lambda@Edge):
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   Content-Security-Policy: default-src 'self'
   ```

4. **Enable DNSSEC** (in GoDaddy):
   - Go to DNS Management
   - Enable DNSSEC if available
   - Adds cryptographic signatures to DNS records

### Domain Configuration Checklist

Use this checklist to ensure everything is configured correctly:

#### Pre-deployment:
- [ ] Domain registered and accessible in GoDaddy
- [ ] Hosting platform deployed and tested
- [ ] SSL certificate created (if using AWS)

#### DNS Configuration:
- [ ] Primary domain (estatefox.com) configured
- [ ] WWW subdomain (www.estatefox.com) configured
- [ ] Dev environment (dev.estatefox.com) configured
- [ ] API subdomain (api.estatefox.com) configured
- [ ] API dev subdomain (api-dev.estatefox.com) configured

#### SSL/HTTPS:
- [ ] SSL certificate issued and active
- [ ] HTTPS enabled on hosting platform
- [ ] HTTP to HTTPS redirect working
- [ ] Certificate valid for all subdomains

#### Testing:
- [ ] DNS propagation complete (all subdomains)
- [ ] Website accessible at estatefox.com
- [ ] Website accessible at www.estatefox.com
- [ ] Dev site accessible at dev.estatefox.com
- [ ] API accessible at api.estatefox.com
- [ ] All URLs serve over HTTPS
- [ ] No SSL certificate warnings

#### Performance:
- [ ] CDN serving static assets
- [ ] Cache headers configured correctly
- [ ] Assets loading quickly
- [ ] Images optimized and loading

#### Monitoring:
- [ ] Set up uptime monitoring (optional)
- [ ] Configure DNS monitoring (optional)
- [ ] Enable CloudWatch alarms for API (if using AWS)

## Next Steps

1. Configure AWS resources (S3, CloudFront, ECR, Lambda)
2. Add secrets to GitHub repository
3. Push to `main` to trigger first deployment
4. Verify deployment
5. Configure custom domain using the instructions above
6. Set up monitoring alerts (optional)
