# Domain Setup Guide

This guide provides step-by-step instructions for connecting your **estatefox.com** domain from GoDaddy to your hosting platform.

## Prerequisites

Before starting, ensure you have:

1. ✅ Access to your GoDaddy account with domain management permissions
2. ✅ The domain **estatefox.com** registered in GoDaddy
3. ✅ Your application deployed to a hosting platform (AWS, Netlify, or GitHub Pages)
4. ✅ GitHub Actions workflows configured and tested

## Overview of Subdomains

Your estatefox.com domain will be configured with the following subdomains:

| Subdomain | Purpose | Example URL |
|-----------|---------|-------------|
| `estatefox.com` | Production website (apex/root domain) | https://estatefox.com |
| `www.estatefox.com` | Production website (www) | https://www.estatefox.com |
| `dev.estatefox.com` | Development environment | https://dev.estatefox.com |
| `api.estatefox.com` | Production API | https://api.estatefox.com |
| `api-dev.estatefox.com` | Development API | https://api-dev.estatefox.com |

## Choose Your Hosting Platform

Select ONE of the following options based on your needs:

- **Option 1: AWS (CloudFront + S3)** - Full control, best performance with global CDN
- **Option 2: Netlify** - Easiest setup, automatic PR previews, built-in SSL
- **Option 3: GitHub Pages** - Simplest option, but production-only (no dev/preview environments)

---

## Option 1: Connect GoDaddy to AWS CloudFront + S3

This option provides full control and best performance with CloudFront's global CDN.

### Step 1: Create SSL Certificate in AWS Certificate Manager (ACM)

1. **Open AWS Certificate Manager** in the AWS Console
   - **⚠️ IMPORTANT:** Switch to **us-east-1 (N. Virginia)** region (required for CloudFront)

2. **Request a certificate:**
   - Click **"Request a certificate"**
   - Choose **"Request a public certificate"**
   - Enter domain names:
     - `estatefox.com`
     - `*.estatefox.com` (wildcard for all subdomains)
   - Validation method: **DNS validation** (recommended)
   - Click **"Request"**

3. **Note the CNAME records** for validation
   - ACM will provide records like:
     ```
     Name:  _abc123.estatefox.com
     Value: _xyz456.acm-validations.aws.
     ```

### Step 2: Add DNS Validation Records in GoDaddy

1. **Log in to GoDaddy:**
   - Go to https://dcc.godaddy.com/domains
   - Click on **estatefox.com**

2. **Access DNS Management:**
   - Click **"DNS"** or **"Manage DNS"**
   - Scroll to the **"Records"** section

3. **Add ACM validation records:**

   For each CNAME record shown in ACM:

   | Field | Value |
   |-------|-------|
   | Type | CNAME |
   | Name | `_abc123` (remove `.estatefox.com` from ACM's name) |
   | Value | `_xyz456.acm-validations.aws.` (exactly as shown in ACM) |
   | TTL | 1 Hour |

   Click **"Add Record"** or **"Save"**

4. **Wait for validation** (usually 5-30 minutes):
   - Return to ACM console
   - Refresh the page - certificate status should change to **"Issued"**

### Step 3: Configure CloudFront Distribution for Custom Domain

1. **Open CloudFront** in AWS Console:
   - Find your distribution (created during infrastructure setup)
   - Click the Distribution ID

2. **Edit Settings:**
   - Click **"General"** tab → **"Edit"**
   - **Alternate domain names (CNAMEs):**
     ```
     estatefox.com
     www.estatefox.com
     ```
   - **Custom SSL certificate:** Select your certificate from dropdown
   - **Supported HTTP versions:** HTTP/2, HTTP/3
   - Click **"Save changes"**

3. **Note the CloudFront domain name:**
   - Example: `d123abc456def.cloudfront.net`
   - You'll need this for GoDaddy DNS records

4. **Repeat for dev environment:**
   - Edit your dev CloudFront distribution
   - Add CNAME: `dev.estatefox.com`
   - Use the same SSL certificate

### Step 4: Configure DNS Records in GoDaddy

1. **Return to GoDaddy DNS Management:**
   - https://dcc.godaddy.com/domains → estatefox.com → DNS

2. **Add/update the following records:**

   **Production Frontend:**

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | CNAME | `www` | `d123abc456def.cloudfront.net` (your CloudFront domain) | 1 Hour |

   **Root Domain Forwarding:**
   - Go to **"Forwarding"** section in GoDaddy
   - Click **"Add Forwarding"**
   - Forward `estatefox.com` to `https://www.estatefox.com`
   - Forward type: **Permanent (301)**

   **Development Frontend:**

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | CNAME | `dev` | `<dev-cloudfront-distribution>.cloudfront.net` | 1 Hour |

   **Production API:**

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | CNAME | `api` | `<api-gateway-domain>.execute-api.us-east-1.amazonaws.com` OR `<lambda-function-url>` | 1 Hour |

   **Development API:**

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | CNAME | `api-dev` | `<dev-api-gateway-domain>.execute-api.us-east-1.amazonaws.com` OR `<dev-lambda-function-url>` | 1 Hour |

3. **Remove conflicting records:**
   - Delete any existing A or CNAME records for `@` or `www` that conflict
   - Keep only the new records you just added

### Step 5: Verify the AWS Connection

1. **Wait for DNS propagation** (5 minutes to 48 hours, usually < 1 hour):
   ```bash
   # Check DNS propagation
   nslookup www.estatefox.com
   nslookup dev.estatefox.com
   nslookup api.estatefox.com

   # Or use online tools:
   # https://www.whatsmydns.net/#CNAME/www.estatefox.com
   # https://dnschecker.org
   ```

2. **Test the website:**
   ```bash
   # Test HTTPS works
   curl -I https://www.estatefox.com
   curl -I https://estatefox.com
   curl -I https://dev.estatefox.com

   # Test API
   curl https://api.estatefox.com/health
   curl https://api-dev.estatefox.com/health

   # Should return 200 OK and show CloudFront headers
   ```

3. **Verify SSL certificate:**
   - Open https://www.estatefox.com in browser
   - Click padlock icon → should show **valid SSL certificate**
   - Certificate should be issued by **Amazon**

---

## Option 2: Connect GoDaddy to Netlify

Netlify provides the easiest setup with automatic SSL certificates and PR previews.

### Step 1: Set Up Custom Domain in Netlify

1. **Log in to Netlify:**
   - Go to https://app.netlify.com
   - Select your **production site**

2. **Add custom domain:**
   - Go to **"Site settings"** → **"Domain management"**
   - Click **"Add custom domain"**
   - Enter: `estatefox.com`
   - Click **"Verify"** and **"Add domain"**

3. **Add www subdomain:**
   - Click **"Add domain alias"**
   - Enter: `www.estatefox.com`
   - Click **"Save"**

4. **Repeat for dev site:**
   - Go to your **dev site** in Netlify
   - Add custom domain: `dev.estatefox.com`

### Step 2: Configure DNS in GoDaddy

**Recommended: Use Netlify DNS (Easiest)**

**In Netlify:**
1. In **"Domain management"**, click **"Set up Netlify DNS"**
2. Netlify will show you nameservers like:
   - `dns1.p01.nsone.net`
   - `dns2.p01.nsone.net`
   - `dns3.p01.nsone.net`
   - `dns4.p01.nsone.net`

**In GoDaddy:**
1. Go to https://dcc.godaddy.com/domains
2. Click **estatefox.com**
3. Scroll to **"Nameservers"** section
4. Click **"Change Nameservers"**
5. Select **"I'll use my own nameservers"**
6. Enter the 4 Netlify nameservers
7. Click **"Save"**

**✅ Advantages:** Netlify manages all DNS, automatic SSL, easier setup

**Alternative: Keep GoDaddy DNS (Manual)**

Add these records in GoDaddy DNS Management:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `www` | `<your-site-name>.netlify.app` | 1 Hour |
| A | `@` | `75.2.60.5` (Netlify's load balancer IP) | 1 Hour |
| CNAME | `dev` | `<your-dev-site-name>.netlify.app` | 1 Hour |

**Note:** Check Netlify's current IP addresses at https://docs.netlify.com/domains-https/custom-domains/

### Step 3: Enable HTTPS in Netlify

1. **Return to Netlify:**
   - Go to **"Domain management"** → **"HTTPS"**
   - Click **"Verify DNS configuration"**
   - Once verified, click **"Provision certificate"**
   - Wait 1-5 minutes for SSL certificate

2. **Enable Force HTTPS:**
   - Toggle **"Force HTTPS"** to ON
   - All HTTP traffic will redirect to HTTPS

### Step 4: Verify the Netlify Connection

1. **Wait for DNS propagation** (5-60 minutes):
   ```bash
   nslookup www.estatefox.com
   nslookup estatefox.com
   nslookup dev.estatefox.com
   ```

2. **Test the site:**
   - Open https://estatefox.com
   - Should redirect to https://www.estatefox.com (or vice versa)
   - SSL certificate should be valid
   - Check dev environment: https://dev.estatefox.com

---

## Option 3: Connect GoDaddy to GitHub Pages

GitHub Pages is the simplest option but only supports **production** (no dev environment or API).

### Step 1: Configure Custom Domain in GitHub

1. **Go to your repository on GitHub:**
   - **Settings** → **Pages**

2. **Add custom domain:**
   - Under **"Custom domain"**, enter: `www.estatefox.com`
   - Click **"Save"**
   - GitHub will create a CNAME file in your repo
   - Wait for DNS check to complete

3. **Enable HTTPS:**
   - Check **"Enforce HTTPS"** (after DNS is configured)

### Step 2: Configure DNS in GoDaddy

1. **Log in to GoDaddy:**
   - Go to https://dcc.godaddy.com/domains
   - Click **estatefox.com** → **DNS**

2. **Add GitHub Pages DNS records:**

   **CNAME for www:**

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | CNAME | `www` | `<your-github-username>.github.io` | 1 Hour |

   **A records for apex domain (add all 4):**

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | A | `@` | `185.199.108.153` | 1 Hour |
   | A | `@` | `185.199.109.153` | 1 Hour |
   | A | `@` | `185.199.110.153` | 1 Hour |
   | A | `@` | `185.199.111.153` | 1 Hour |

   **AAAA records for IPv6 (optional but recommended - add all 4):**

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | AAAA | `@` | `2606:50c0:8000::153` | 1 Hour |
   | AAAA | `@` | `2606:50c0:8001::153` | 1 Hour |
   | AAAA | `@` | `2606:50c0:8002::153` | 1 Hour |
   | AAAA | `@` | `2606:50c0:8003::153` | 1 Hour |

### Step 3: Verify GitHub Pages Connection

1. **Wait for DNS propagation** (15-60 minutes):
   ```bash
   nslookup www.estatefox.com
   # Should show <username>.github.io

   nslookup estatefox.com
   # Should show GitHub's IPs
   ```

2. **Verify in GitHub:**
   - Return to **Settings** → **Pages**
   - Should show **"DNS check successful"**
   - Enable **"Enforce HTTPS"**

3. **Test the site:**
   - Open https://estatefox.com
   - Open https://www.estatefox.com
   - Both should work with valid SSL

---

## Verification Checklist

Use this checklist to ensure everything is configured correctly:

### DNS Configuration:
- [ ] Primary domain (estatefox.com) configured
- [ ] WWW subdomain (www.estatefox.com) configured
- [ ] Dev environment (dev.estatefox.com) configured (if using AWS/Netlify)
- [ ] API subdomain (api.estatefox.com) configured (if using AWS)
- [ ] API dev subdomain (api-dev.estatefox.com) configured (if using AWS)

### SSL/HTTPS:
- [ ] SSL certificate issued and active
- [ ] HTTPS enabled on hosting platform
- [ ] HTTP to HTTPS redirect working
- [ ] Certificate valid for all subdomains

### Testing:
- [ ] DNS propagation complete (all subdomains)
- [ ] Website accessible at estatefox.com
- [ ] Website accessible at www.estatefox.com
- [ ] Dev site accessible at dev.estatefox.com (if applicable)
- [ ] API accessible at api.estatefox.com (if applicable)
- [ ] All URLs serve over HTTPS
- [ ] No SSL certificate warnings

### Performance:
- [ ] CDN serving static assets
- [ ] Cache headers configured correctly
- [ ] Assets loading quickly
- [ ] Images optimized and loading

---

## DNS Propagation and Testing

### Check DNS Propagation:

```bash
# Local checks
dig estatefox.com
dig www.estatefox.com
dig dev.estatefox.com
dig api.estatefox.com

# Check with Google DNS
nslookup estatefox.com 8.8.8.8

# Or use online tools:
# https://www.whatsmydns.net
# https://dnschecker.org
```

### Test Endpoints:

```bash
# Frontend
curl -I https://estatefox.com
curl -I https://www.estatefox.com
curl -I https://dev.estatefox.com

# Backend
curl https://api.estatefox.com/health
curl https://api-dev.estatefox.com/health
```

### Expected Response Headers:

**AWS/CloudFront:**
```
HTTP/2 200
x-amz-cf-id: ... (CloudFront)
x-cache: Hit from cloudfront
```

**Netlify:**
```
HTTP/2 200
x-nf-request-id: ... (Netlify)
server: Netlify
```

**GitHub Pages:**
```
HTTP/2 200
server: GitHub.com
```

---

## Common Issues and Troubleshooting

### Issue: DNS not propagating

**Symptoms:** Domain doesn't resolve or shows old IP addresses

**Solutions:**
- ⏰ Wait longer (can take up to 48 hours, usually < 1 hour)
- 🔄 Try different DNS servers: `nslookup estatefox.com 8.8.8.8`
- ✏️ Check for typos in DNS records
- 🧹 Flush local DNS cache: `sudo dscacheutil -flushcache` (macOS) or `ipconfig /flushdns` (Windows)

### Issue: SSL certificate error

**Symptoms:** Browser shows "Not Secure" or certificate warnings

**Solutions:**
- ⏰ Ensure DNS is fully propagated first (SSL can't be issued until DNS works)
- 🌍 In AWS: Verify certificate is in **us-east-1** region (required for CloudFront)
- 🔄 In Netlify: Click **"Renew certificate"** if needed
- 🔄 In GitHub Pages: Uncheck and recheck **"Enforce HTTPS"**

### Issue: "Domain already in use" in Netlify

**Symptoms:** Netlify won't let you add the domain

**Solutions:**
- 🔍 Check if domain is configured in another Netlify site
- 🗑️ Remove domain from old site first
- ✅ Verify domain ownership through DNS or email

### Issue: CloudFront shows 403 Forbidden

**Symptoms:** CloudFront URL works but shows 403 error

**Solutions:**
- 📁 Check S3 bucket has a public read policy or CloudFront origin access control
- ⚙️ Verify CloudFront origin is configured correctly
- 📄 Check that `index.html` exists in the S3 bucket
- 🔑 Verify CloudFront has permission to access S3

### Issue: CNAME records not allowed for apex domain

**Symptoms:** GoDaddy won't let you add CNAME for `@` (root)

**Solutions:**
- 🔀 Use GoDaddy's **domain forwarding** feature
- ➡️ Forward `@` (apex) to `www` subdomain with 301 redirect
- 🔢 Or use A records as specified above (GitHub Pages, Netlify)

### Issue: "DNS check failed" in GitHub Pages

**Symptoms:** GitHub can't verify your domain

**Solutions:**
- ⏰ Wait for DNS to fully propagate (15-60 minutes)
- ✏️ Double-check A records match GitHub's IPs exactly
- 🔄 Try removing and re-adding the custom domain
- 🧹 Clear browser cache and try again

---

## Security Best Practices

### 1. Always Use HTTPS
- ✅ Enable **"Force HTTPS"** in Netlify
- ✅ Enable **"Enforce HTTPS"** in GitHub Pages
- ✅ Configure HTTPS redirect in CloudFront

### 2. Use Strong SSL/TLS
- ✅ TLS 1.2 minimum (TLS 1.3 recommended)
- ✅ Modern cipher suites only
- ✅ Disable deprecated protocols (SSL 3.0, TLS 1.0, TLS 1.1)

### 3. Set Security Headers

Configure in CloudFront, Netlify, or Lambda@Edge:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### 4. Enable DNSSEC (Optional)

In GoDaddy:
1. Go to **DNS Management**
2. Enable **DNSSEC** if available
3. Adds cryptographic signatures to DNS records
4. Protects against DNS spoofing attacks

---

## Next Steps After Domain Setup

Once your domain is connected and working:

1. ✅ **Test all environments:**
   - Production: https://estatefox.com
   - Development: https://dev.estatefox.com
   - API: https://api.estatefox.com

2. ✅ **Update GitHub secrets** (if not already done):
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for required secrets

3. ✅ **Configure monitoring** (optional):
   - Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
   - Configure DNS monitoring
   - Enable CloudWatch alarms (if using AWS)

4. ✅ **Update documentation:**
   - Add domain URLs to README.md
   - Update API documentation with production URLs

5. ✅ **Test GitHub Actions workflows:**
   - Push to `dev` branch → should deploy to dev.estatefox.com
   - Create PR → should create preview deployment (if using Netlify)
   - Merge to `main` → should deploy to estatefox.com

---

## Additional Resources

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Full deployment guide with GitHub Actions
- **[AWS Certificate Manager Documentation](https://docs.aws.amazon.com/acm/)** - SSL certificate management
- **[Netlify Custom Domains](https://docs.netlify.com/domains-https/custom-domains/)** - Netlify domain setup
- **[GitHub Pages Custom Domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)** - GitHub Pages setup
- **[GoDaddy DNS Management](https://www.godaddy.com/help/manage-dns-680)** - GoDaddy help center

---

## Need Help?

If you encounter issues not covered in this guide:

1. 🔍 Check the [troubleshooting section](#common-issues-and-troubleshooting) above
2. 📖 Review the full [DEPLOYMENT.md](./DEPLOYMENT.md) documentation
3. 🌐 Use online DNS tools to diagnose issues:
   - https://www.whatsmydns.net
   - https://dnschecker.org
   - https://mxtoolbox.com/SuperTool.aspx
4. 📧 Contact your hosting platform's support (AWS, Netlify, or GitHub)

---

**Last Updated:** December 2024
