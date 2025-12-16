# Build shell site - v1

**Issue:** #16
**Generated:** 2025-12-15 16:04
**Version:** 1

## Problem

I want to get a shell estatefox.com site up on the web.  My domain is hosted at godaddy.  Code for the old version of my site is contained at /Users/marcknight/Dropbox/web-projects/map-sites.  Can you do a comprehensive review of the codebase and modify the code here so that there is a working placeholder site available on the web that can be deployed via github actions.  Even better -- both dev and prod versions of the site and the ability to preview how the site looks on every PR.  Please use colors and other image assets from the old site to build this shell site.  Provide me with instructions on how to connect my estatefox.com domain to how this site is hosted.

## Goals

- [ ] Analyze existing codebase at /Users/marcknight/Dropbox/web-projects/map-sites to understand structure, extract color schemes, images, and reusable assets
- [ ] Create modern shell site structure with HTML5, CSS3, and responsive design using extracted assets and color scheme from old site
- [ ] Set up GitHub Actions workflow for automated deployment with separate dev and production environments using GitHub Pages or Netlify
- [ ] Configure PR preview functionality using GitHub Actions to deploy preview versions of the site for each pull request
- [ ] Create comprehensive documentation with step-by-step instructions for connecting estatefox.com domain from GoDaddy to the hosting platform
- [ ] Test deployment workflows, verify dev/prod environments work correctly, and validate PR preview functionality
- [ ] Optimize site performance, add meta tags for SEO, ensure mobile responsiveness, and validate HTML/CSS
- [ ] Create Theme Configuration with Brand Colors
- [ ] Create Shell Landing Page Component
- [ ] Configure GitHub Pages Deployment for Static Shell Site
- [ ] Add PR Preview Deployments
- [ ] Create Domain Connection Documentation
- [ ] Update App Configuration for Web Deployment
- [ ] Test and Validate Deployment Pipeline

## Non-goals

- [To be determined based on scope discussions]

## Requirements

- R1: Analyze existing codebase at /Users/marcknight/Dropbox/web-projects/map-sites to understand structure, extract color schemes, images, and reusable assets
- R2: Create modern shell site structure with HTML5, CSS3, and responsive design using extracted assets and color scheme from old site (`index.html`)
- R3: Set up GitHub Actions workflow for automated deployment with separate dev and production environments using GitHub Pages or Netlify (`.github/workflows/deploy.yml`)
- R4: Configure PR preview functionality using GitHub Actions to deploy preview versions of the site for each pull request (`.github/workflows/pr-preview.yml`)
- R5: Create comprehensive documentation with step-by-step instructions for connecting estatefox.com domain from GoDaddy to the hosting platform (`DEPLOYMENT.md`)
- R6: Test deployment workflows, verify dev/prod environments work correctly, and validate PR preview functionality
- R7: Optimize site performance, add meta tags for SEO, ensure mobile responsiveness, and validate HTML/CSS
- R8: Create Theme Configuration with Brand Colors (`frontend/constants/theme.ts`)
- R9: Create Shell Landing Page Component (`frontend/app/index.tsx`)
- R10: Configure GitHub Pages Deployment for Static Shell Site (`.github/workflows/deploy-web.yml`)
- R11: Add PR Preview Deployments (`.github/workflows/pr-preview.yml`)
- R12: Create Domain Connection Documentation (`docs/DOMAIN-SETUP.md`)
- R13: Update App Configuration for Web Deployment (`frontend/app.json`)
- R14: Test and Validate Deployment Pipeline

## Open Questions

- [Discovered during research - TBD]

## Implementation Notes

Excellent! Now I have a comprehensive understanding of the codebase. Let me compile the research notes:

---

# Research Notes: Estatefox - Full-Stack Real Estate Application

## Facts

### Project Overview
- **Repository:** GitHub at `https://github.com/knight-systems/estatefox`
- **Current state:** Full-stack monorepo with production-ready infrastructure, but focused on mobile-first (Expo) development
- **Architecture:** Monorepo containing frontend (Expo/React Native) and backend (FastAPI) in `/Users/marcknight/Dropbox/web-projects/agent-platform/trees/ee3dda76`
- **Git structure:** Using git worktrees pointing to main repo at `/Users/marcknight/Dropbox/web-projects/agent-platform/repos/estatefox`

### Project Structure
**Root files** (`package.json:5-16`):
- `npm run dev` - Starts backend + frontend concurrently
- `npm run test` - Runs all tests
- `npm run generate:api` - Exports OpenAPI spec from backend, generates TypeScript types for frontend
- `npm run lint` - Runs linting for both backend and frontend

**Frontend** (`frontend/`):
- Built with Expo Router for file-based routing (`frontend/app/(tabs)/`, `frontend/app/(auth)/`)
- React Native with TypeScript (`frontend/package.json:24-26`)
- Uses React Query v5 for data fetching (`frontend/app/_layout.tsx:3-23`)
- Jest testing with React Native Testing Library (`frontend/jest.setup.ts:1-40`)
- MSW (Mock Service Worker) for API mocking in tests (`frontend/tests/mocks/server.ts`)
- Assets directory exists but is empty (only `.gitkeep` placeholder at `frontend/assets/.gitkeep`)

**Backend** (`backend/`):
- FastAPI service (`backend/src/estatefox_api/main.py:22-43`)
- Uses Pydantic schemas with `BaseApiModel` for automatic snake_case→camelCase conversion (`backend/src/estatefox_api/schemas/base.py:12-30`)
- Routes include health check (`/health`) and items CRUD (`/items`) with in-memory storage
- Mangum handler for AWS Lambda deployment (`backend/src/estatefox_api/main.py:43`)
- Docker image uses `public.ecr.aws/lambda/python:3.11` base (`backend/Dockerfile:1`)

**Tests**:
- Backend: pytest in `backend/tests/` with conftest.py setup
- Frontend: Jest tests in `frontend/tests/` with factories, mocks, and utilities
- Coverage tracking configured

### Type-Safe API Communication
- Backend exports OpenAPI spec via `python scripts/export-openapi.py`
- Frontend generates TypeScript types using `@hey-api/openapi-ts` configured in `frontend/openapi-ts.config.ts:19-31`
- Generated types go to `frontend/src/api/generated/`
- CI/CD automation ensures types stay in sync (`.github/workflows/ci.yml:39-46`)

### Deployment Infrastructure

**CI/CD Workflows** (`.github/workflows/`):

1. **PR Checks** (`ci.yml`):
   - Backend job: lint (ruff), type check (mypy), tests, export OpenAPI spec
   - Frontend job (depends on backend): download spec, generate types, type check (tsc), tests
   - Runs on PR and push to main

2. **Deployment** (`deploy.yml`):
   - Triggers on push to main or manual dispatch
   - Checks for AWS credentials before deploying
   - Frontend: `expo export --platform web` → S3 sync → CloudFront invalidation (`deploy.yml:76-94`)
   - Backend: pytest tests → docker build → ECR push → Lambda function update (`deploy.yml:118-141`)
   - Path-based filtering: only deploys changed components (`deploy.yml:45-52`)

**GitHub Secrets Required for Deployment** (`deploy.yml:27-32`):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME` (frontend web hosting)
- `CLOUDFRONT_DISTRIBUTION_ID` (frontend CDN)
- `ECR_REGISTRY` (backend container registry)

### Current API Endpoints
- `GET /health` - Health check with service name and environment
- `POST /items` - Create item, returns 201 with ItemResponse
- `GET /items` - List all items, returns ItemListResponse
- `GET /items/{item_id}` - Get specific item
- `PATCH /items/{item_id}` - Update item (partial)
- `DELETE /items/{item_id}` - Delete item, returns 204

### Frontend Components
**Home page** (`frontend/app/(tabs)/home.tsx:1-77`):
- Uses `StyleSheet.create()` for styling
- Colors: `#F2F2F7` (background), `#FFFFFF` (header), `#000000` (text)
- Bootstrap card-based layout with basic typography

**UI Components** (`frontend/components/ui/`):
- `Button.tsx`
- `Card.tsx`

**API Client** (`frontend/services/api.ts:1-102`):
- Class-based fetch wrapper with token support
- Methods: `get()`, `post()`, `put()`, `delete()`
- Returns `ApiResponse<T>` type with data, error, status

**React Query Hooks** (`frontend/hooks/queries/useItems.ts`):
- Query key factory pattern (`itemKeys`)
- `useItems()` - fetch all items
- `useItem(id)` - fetch single item
- `useCreateItem()` - create with auto-invalidation
- `useUpdateItem()` - partial updates
- `useDeleteItem()` - delete with cache removal

### Configuration Files
- `app.json` (`frontend/app.json:1-46`): Expo configuration with package `com.knightsystems.estatefox`
- `openapi-ts.config.ts` (`frontend/openapi-ts.config.ts`): Uses local `./openapi.json` or `OPENAPI_URL` env var
- `pyproject.toml` (`backend/pyproject.toml`): Python 3.11+, dependencies: fastapi, mangum, pydantic, boto3, pyhumps
- Pre-commit hooks (`/.pre-commit-config.yaml`): ruff, mypy, eslint, prettier, TypeScript checker

### Recent Commits
- 49fc8b0: "Fix #14: Bring frontend test coverage to 70% (#15)"
- 96166bd: "Fix #12: Fix frontend tests (#13)"
- ddd965a: "feat: remove notes directory"
- 4799512: "feat: Add pre-commit hooks for code quality (#8)"
- 5886f7e: "Initial commit from fullstack-monorepo template"

## File Map

| File | Purpose | Key Functions |
|------|---------|---------------|
| `package.json` | Root monorepo scripts | dev, test, generate:api, lint, typecheck |
| `.github/workflows/ci.yml` | PR validation | backend tests, frontend tests, type generation |
| `.github/workflows/deploy.yml` | Production deployment | deploy-frontend-web, deploy-backend |
| `frontend/app/_layout.tsx` | Root layout with providers | RootLayout (QueryClientProvider, Stack) |
| `frontend/app/index.tsx` | Entry point | Index (redirects to home) |
| `frontend/app/(tabs)/home.tsx` | Home screen UI | HomeScreen (cards with info and buttons) |
| `frontend/services/api.ts` | API client | ApiClient class (get, post, put, delete) |
| `frontend/hooks/queries/useItems.ts` | Data fetching hooks | useItems, useItem, useCreateItem, useUpdateItem, useDeleteItem |
| `frontend/jest.setup.ts` | Test configuration | MSW server setup, crypto polyfill |
| `frontend/tests/utils/test-utils.tsx` | Test utilities | customRender, customRenderHook, createTestQueryClient |
| `backend/src/estatefox_api/main.py` | FastAPI app | app (FastAPI instance), handler (Mangum Lambda) |
| `backend/src/estatefox_api/config.py` | Settings | Settings class (environment, debug, cors_origins) |
| `backend/src/estatefox_api/routes/health.py` | Health check | health_check() endpoint |
| `backend/src/estatefox_api/routes/items.py` | Items CRUD | create_item, list_items, get_item, update_item, delete_item, _reset_store |
| `backend/src/estatefox_api/schemas/base.py` | Base schema | BaseApiModel (snake_case→camelCase conversion) |
| `backend/src/estatefox_api/schemas/items.py` | Item schemas | ItemCreate, ItemUpdate, ItemResponse, ItemListResponse |
| `backend/Dockerfile` | Container image | Multi-stage build using AWS Lambda Python base |
| `.pre-commit-config.yaml` | Code quality | Ruff, mypy, eslint, prettier, TypeScript checks |

## Invariants

Must be preserved for the system to function:

1. **Type Safety Invariant**: Frontend types must match backend schemas
   - Backend Pydantic schemas → OpenAPI JSON export → TypeScript types
   - If schemas change without type regeneration, frontend breaks (`frontend/openapi-ts.config.ts`, `npm run generate:api`)

2. **API Communication Invariant**: All backend schemas must inherit from `BaseApiModel`
   - Ensures automatic snake_case→camelCase conversion (`backend/src/estatefox_api/schemas/base.py:12-30`)
   - Maintains consistent JSON naming across frontend/backend boundary

3. **Deployment Path Invariant**: Only changed components deploy via path filtering
   - Frontend changes only trigger `deploy-frontend-web` job
   - Backend changes only trigger `deploy-backend` job
   - Prevents unnecessary deployments (`.github/workflows/deploy.yml:45-52`)

4. **AWS Credentials Invariant**: Deployment only runs if secrets are configured
   - CI job checks for `AWS_ACCESS_KEY_ID` before deploying (`deploy.yml:18-33`)
   - Missing credentials gracefully skip deployment with warning message

5. **Lambda Handler Invariant**: Backend exports Mangum handler at module level
   - `handler = Mangum(app, lifespan="off")` must exist (`backend/src/estatefox_api/main.py:43`)
   - Dockerfile CMD references `src.estatefox_api.main.handler` (`backend/Dockerfile:16`)

6. **React Query Cache Invariant**: Query key factories must use consistent naming
   - Keys use `.all`, `.lists()`, `.list()`, `.details()`, `.detail()` pattern (`frontend/hooks/queries/useItems.ts:62-69`)
   - Cache invalidation depends on these keys being consistent across mutations and queries

7. **OpenAPI Generation Invariant**: Frontend needs local or remote OpenAPI spec
   - Default reads `./openapi.json` in frontend directory
   - CI downloads artifact from backend before generating types (`ci.yml:67-71`)
   - Must run `npm run generate:api` after any backend schema changes

8. **Port Configuration Invariant**: Development servers use fixed ports
   - Backend: port 8000 (uvicorn, `package.json:7`)
   - Frontend: determined by Expo (typically 8081, `app/_layout.tsx`)
   - API client configured to use `https://api.estatefox.example.com` in production (`frontend/services/api.ts:1`)

## Patterns

### Backend Patterns

**Schema Definition** (`backend/src/estatefox_api/schemas/`):
- All schemas inherit `BaseApiModel` for automatic JSON naming conversion
- Use `Field()` with validation rules and descriptions for OpenAPI docs
- Separate request (`*Create`, `*Update`) and response (`*Response`, `*ListResponse`) schemas
- Response schemas include all server-generated fields (id, timestamps)

**Route Definition** (`backend/src/estatefox_api/routes/items.py`):
- Router created with prefix and tags for OpenAPI grouping
- All routes have explicit `response_model` for type safety
- Use `status_code` for HTTP 201 (created), 204 (no content)
- Docstrings provide OpenAPI operation summaries and descriptions
- In-memory store pattern used for demonstration (comment at lines 34-35 recommends database replacement)

**Error Handling**:
- HTTPException with explicit status codes and detail messages
- 404 errors when resource not found (e.g., item_id not found)
- Follows REST conventions

### Frontend Patterns

**React Query Hook Structure** (`frontend/hooks/queries/useItems.ts`):
- Query key factory with `.all`, `.lists()`, `.details()`, `.detail(id)` hierarchy
- useQuery for read operations
- useMutation for write operations with `onSuccess` cache invalidation
- Options parameter allows custom query settings while preserving standard keys

**Component Structure**:
- StyleSheet.create() for style objects
- View/ScrollView for layouts
- Consistent color palette (system grays, white backgrounds)

**Testing Setup** (`frontend/tests/utils/test-utils.tsx`):
- Custom render wrapper that provides QueryClientProvider
- Fresh QueryClient per test with retry: false, gcTime: 0, staleTime: 0
- Test utilities re-export RTL for convenience

**API Integration**:
- Fetch-based ApiClient class (not generated)
- Token support for future authentication
- Centralized in `services/api.ts`
- React Query hooks layer on top of ApiClient

### CI/CD Patterns

**Artifact Flow** (`.github/workflows/ci.yml`):
1. Backend job exports OpenAPI spec
2. Artifact stored with 1-day retention
3. Frontend job downloads artifact before type generation
4. Frontend tests run with generated types to catch mismatches

**Deployment Decision Logic** (`.deploy.yml`):
- Check secrets exist before deploying (graceful skip)
- Detect path changes (dorny/paths-filter)
- Only deploy modified components
- Backend: Docker build → ECR push → Lambda update
- Frontend: Expo export → S3 sync → CloudFront invalidate

### Development Workflow Patterns

- `npm run dev` starts both services concurrently
- `npm run generate:api` required after backend schema changes
- `pre-commit run --all-files` before committing
- Tests run automatically on PR
- Deployment automatic on main push (if credentials configured)

## Risks

### Deployment Configuration Risks
1. **Missing AWS Secrets**: Deployment silently skips if `AWS_ACCESS_KEY_ID` not configured
   - Risk: Developer may think deploy succeeded but it was skipped
   - Mitigation: Job output warns about missing credentials
   
2. **Stale Domain Configuration**: API_BASE_URL hardcoded as `https://api.estatefox.example.com` in `frontend/services/api.ts:1`
   - Risk: Points to placeholder domain, not actual estatefox.com or deployed backend
   - Needs: Environment-specific configuration (dev/prod URLs)

3. **Lambda Handler Assumption**: Backend assumes Mangum wrapping at module level
   - Risk: If handler missing or misconfigured, Docker image builds but Lambda fails at runtime
   - Mitigation: Dockerfile CMD would fail if handler doesn't exist

### Data Integrity Risks
1. **In-Memory Storage**: Items stored in `_items` dict in `backend/src/estatefox_api/routes/items.py:36`
   - Risk: Data lost on server restart; no persistence; not thread-safe
   - Mitigation: Comment recommends database replacement, but placeholder remains
   
2. **No Database Layer**: No SQLAlchemy or database integration exists
   - Risk: Multiple backend instances can't share state; testing with real data requires database setup
   - Mitigation: Architecture docs reference database extension patterns

### Development Workflow Risks
1. **Type Generation Must Be Manual**: After backend schema changes, must run `npm run generate:api`
   - Risk: Easy to forget; leads to type mismatches and test failures
   - Mitigation: CI/CD catches it before merge, but dev experience friction

2. **OpenAPI Spec Artifact Dependency**: Frontend CI depends on backend artifact
   - Risk: If artifact upload fails silently, frontend gets old types
   - Mitigation: Upload uses standard GitHub action; cleanup is automatic

### Asset & UI Risks
1. **Empty Assets Directory**: `frontend/assets/` only has `.gitkeep` placeholder
   - Risk: No icons, splash screens, or branding images exist
   - Requirement: Images needed for: favicon, icon.png, splash.png, adaptive-icon.png per `app.json`
   
2. **Placeholder Home Screen**: Home page has generic "Welcome to Estatefox" content
   - Risk: Not branded or customized for real estate/South Florida use case
   - Requirement: Need to implement actual real estate UI with property listings

3. **Missing Environment Configuration**: No `.env` file examples or environment variable setup documented in frontend
   - Risk: Dev may not know to set API base URL for different environments
   - Note: Backend has `config.py` with environment variables, frontend hardcodes URL

### Testing Coverage Risks
1. **Recent Test Fixes Needed**: Git history shows recent test fixing commits (49fc8b0, 96166bd)
   - Risk: Tests may be fragile or incomplete
   - Status: Last commit was "Bring frontend test coverage to 70%"

2. **No E2E Tests**: Architecture mentions Detox as option but not implemented
   - Risk: Full user flow not validated (login → search → view listings)
   - Mitigation: Unit tests exist for components and hooks

### Production Deployment Risks
1. **CORS Set to Wildcard**: Backend config `cors_origins: list[str] = ["*"]` in `backend/src/estatefox_api/config.py:18`
   - Risk: Allows requests from any origin in development; should be restricted for production
   - Mitigation: Configuration allows env var override

2. **No Authentication**: No auth routes, JWT, or user management implemented
   - Risk: All API endpoints public; no user-specific data isolation
   - Note: Issue description says "add shell site" (not full app), but this is a future concern

---

This codebase is a **complete, production-ready fullstack template** with:
- ✅ Type-safe frontend/backend communication
- ✅ Automated CI/CD with deployment
- ✅ Testing infrastructure (unit tests, mocking)
- ✅ Code quality tools (linting, formatting, type checking)
- ⚠️ Placeholder data storage (in-memory, needs database)
- ⚠️ Empty assets directory (needs branding images)
- ⚠️ Placeholder home page UI (needs real estate features)
- ⚠️ Hardcoded API URL (needs environment config)

## Implementation Plan

Now I have a complete understanding. Based on the user feedback, the key clarification is:
1. **We are updating code in THIS repo** (the agent-platform/estatefox repo), not creating a new one
2. **Keep the existing template/structure** - this is already an Expo app with a FastAPI backend
3. **Use the old site only for reference** - to understand what it did and extract assets/colors

The old site was a Django real estate site. The logos show:
- Brand colors: Navy blue (#17425a), Light blue (#2d99d1), and Orange (#ea8a2e)
- Fonts: Raleway and Bitter
- Logo: Fox logo with "EstateFox" text

Now I can provide the refined plan:

---

# Implementation Plan for Issue #16

## Summary
Update the existing Expo/FastAPI monorepo in this repo to serve as a shell estatefox.com site. Extract assets (logos, colors, fonts) from the old Django site at `/Users/marcknight/Dropbox/web-projects/map-sites`, create a modern placeholder landing page using the existing frontend structure, and configure GitHub Actions for dev/prod deployments with PR previews. The existing repo structure (Expo frontend + FastAPI backend) will be preserved and enhanced.

## Classification
- **Type**: feature
- **Complexity**: medium

## Tasks

### Task 1: Extract and Copy Assets from Old Site
**Files to modify:**
- `frontend/assets/` (new files)
- `frontend/app.json` (update branding)

**Details:**
Copy the following assets from the old site to the frontend:
- `/Users/marcknight/Dropbox/web-projects/map-sites/project/src/img/logo-full.png` → `frontend/assets/logo-full.png`
- `/Users/marcknight/Dropbox/web-projects/map-sites/project/src/img/estatefox-horiz.png` → `frontend/assets/logo-horizontal.png`
- `/Users/marcknight/Dropbox/web-projects/map-sites/project/src/img/fox-logo.png` → `frontend/assets/fox-icon.png`
- `/Users/marcknight/Dropbox/web-projects/map-sites/project/src/img/favicon.ico` → `frontend/assets/favicon.ico`

**Color scheme extracted from old site:**
- Primary Navy: `#17425a` (dark blue - "Estate" text)
- Primary Cyan: `#2d99d1` (light blue - "Fox" text)
- Primary Orange: `#ea8a2e` (accent color)
- Link color: `#197db9`
- Text color: `#333333`

**Fonts:** Raleway and Bitter (from Google Fonts)

---

### Task 2: Create Theme Configuration with Brand Colors
**Files to modify:**
- `frontend/constants/theme.ts` (new file)

**Code snippet:**
```typescript
// frontend/constants/theme.ts
export const colors = {
  primary: {
    navy: '#17425a',
    cyan: '#2d99d1',
    orange: '#ea8a2e',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
  },
  background: {
    white: '#ffffff',
    light: '#f5f5f5',
  },
  link: '#197db9',
};

export const fonts = {
  heading: 'Raleway',
  body: 'Bitter',
};
```

---

### Task 3: Create Shell Landing Page Component
**Files to modify:**
- `frontend/app/index.tsx` (update existing)
- `frontend/components/LandingPage.tsx` (new file)

**Details:**
Replace the current index page with a professional shell landing page that includes:
- EstateFox logo header
- Hero section with Miami real estate imagery
- "Coming Soon" or placeholder messaging
- Contact information
- Responsive design for mobile/desktop

**Code snippet for LandingPage.tsx:**
```typescript
import { View, Text, Image, StyleSheet, Pressable, Linking } from 'react-native';
import { colors, fonts } from '../constants/theme';

export function LandingPage() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/logo-horizontal.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.hero}>
        <Text style={styles.heading}>Miami Luxury Real Estate</Text>
        <Text style={styles.subheading}>Coming Soon</Text>
        <Text style={styles.description}>
          EstateFox is your premier destination for luxury condos and homes in Miami.
        </Text>
      </View>
      <View style={styles.footer}>
        <Pressable onPress={() => Linking.openURL('mailto:info@estatefox.com')}>
          <Text style={styles.contactLink}>Contact Us</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

---

### Task 4: Configure GitHub Pages Deployment for Static Shell Site
**Files to modify:**
- `.github/workflows/deploy-web.yml` (new file for GitHub Pages)
- `frontend/package.json` (add web build scripts)

**Details:**
Create a new GitHub Actions workflow specifically for deploying the web version to GitHub Pages, which provides free hosting with custom domain support.

**Code snippet for deploy-web.yml:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npx expo export --platform web
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/dist

  deploy:
    if: github.ref == 'refs/heads/main'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

### Task 5: Add PR Preview Deployments
**Files to modify:**
- `.github/workflows/pr-preview.yml` (new file)

**Details:**
Configure PR preview deployments using a service like Netlify, Vercel, or surge.sh for automatic preview URLs on every PR.

**Code snippet for pr-preview.yml (using surge.sh):**
```yaml
name: PR Preview

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm install -g surge
      - run: npx expo export --platform web
      - name: Deploy Preview
        run: surge ./dist estatefox-pr-${{ github.event.pull_request.number }}.surge.sh --token ${{ secrets.SURGE_TOKEN }}
      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployed to: https://estatefox-pr-${{ github.event.pull_request.number }}.surge.sh'
            })
```

---

### Task 6: Create Domain Connection Documentation
**Files to modify:**
- `docs/DOMAIN-SETUP.md` (new file)

**Details:**
Create comprehensive documentation for connecting estatefox.com from GoDaddy to GitHub Pages.

**Content outline:**
```markdown
# Connecting estatefox.com to GitHub Pages

## Prerequisites
- GitHub Pages enabled on this repository
- Access to GoDaddy DNS settings for estatefox.com

## Step 1: Configure GitHub Pages Custom Domain
1. Go to repository Settings > Pages
2. Under "Custom domain", enter `estatefox.com`
3. Check "Enforce HTTPS"

## Step 2: Configure GoDaddy DNS
Add the following DNS records in GoDaddy:

### For apex domain (estatefox.com):
| Type | Name | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

### For www subdomain:
| Type | Name | Value |
|------|------|-------|
| CNAME | www | <username>.github.io |

## Step 3: Create CNAME File
Add `frontend/public/CNAME` containing:
```
estatefox.com
```

## Step 4: Wait for DNS Propagation
DNS changes can take 24-48 hours. Verify with:
```bash
dig estatefox.com +noall +answer
```

## Troubleshooting
- If HTTPS isn't working, wait 24 hours and try re-enabling in GitHub Pages settings
- Clear browser cache if seeing old content
```

---

### Task 7: Update App Configuration for Web Deployment
**Files to modify:**
- `frontend/app.json`
- `frontend/public/CNAME` (new file)

**Details:**
Update Expo configuration for proper web build and add CNAME file for GitHub Pages custom domain.

**Code snippet for app.json updates:**
```json
{
  "expo": {
    "name": "EstateFox",
    "slug": "estatefox",
    "scheme": "estatefox",
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.ico"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

---

### Task 8: Test and Validate Deployment Pipeline
**Files to modify:** None (testing task)

**Details:**
1. Run local web build: `cd frontend && npx expo export --platform web`
2. Test locally with: `npx serve dist`
3. Create a test PR to verify preview deployment works
4. Merge to main and verify production deployment
5. Verify site renders correctly at the deployed URL

---

## Testing Strategy
1. **Local Testing**: Run `npx expo export --platform web` and serve locally to verify the shell site renders correctly
2. **PR Preview Testing**: Create a test PR to verify the preview deployment workflow functions and produces a working preview URL
3. **Production Deployment Testing**: Merge to main and verify the GitHub Pages deployment completes successfully
4. **Cross-browser Testing**: Verify the landing page displays correctly on Chrome, Firefox, Safari, and mobile browsers
5. **Domain Configuration Testing**: After DNS setup, verify estatefox.com correctly resolves to the GitHub Pages site

## Risks
1. **GitHub Pages Limitations**: GitHub Pages only serves static content - the existing backend API will still need AWS deployment for full functionality
2. **DNS Propagation Delays**: Custom domain may take 24-48 hours to propagate after GoDaddy configuration
3. **Surge.sh Token Required**: PR previews using surge.sh require setting up a `SURGE_TOKEN` secret in the repository
4. **Expo Web Compatibility**: Some React Native components may need web-specific handling - will use `Platform.select()` where needed

## Task List

- [ ] Analyze existing codebase at /Users/marcknight/Dropbox/web-projects/map-sites to understand structure, extract color schemes, images, and reusable assets
- [ ] Create modern shell site structure with HTML5, CSS3, and responsive design using extracted assets and color scheme from old site
- [ ] Set up GitHub Actions workflow for automated deployment with separate dev and production environments using GitHub Pages or Netlify
- [ ] Configure PR preview functionality using GitHub Actions to deploy preview versions of the site for each pull request
- [ ] Create comprehensive documentation with step-by-step instructions for connecting estatefox.com domain from GoDaddy to the hosting platform
- [ ] Test deployment workflows, verify dev/prod environments work correctly, and validate PR preview functionality
- [ ] Optimize site performance, add meta tags for SEO, ensure mobile responsiveness, and validate HTML/CSS
- [ ] Create Theme Configuration with Brand Colors
- [ ] Create Shell Landing Page Component
- [ ] Configure GitHub Pages Deployment for Static Shell Site
- [ ] Add PR Preview Deployments
- [ ] Create Domain Connection Documentation
- [ ] Update App Configuration for Web Deployment
- [ ] Test and Validate Deployment Pipeline

---
_Generated by SDLC Agent - OpenSpec Pattern_
