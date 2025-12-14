# Fix frontend tests - v1

**Issue:** #12
**Generated:** 2025-12-14 06:06
**Version:** 1

## Problem

The frontend tests are failing in CI on the Node.js step with the error message below. Please fix this test and make sure the entire CI test suite passes before merging -- fix any other issues that come up.

Run actions/setup-node@v4
with:
node-version: 18
cache: npm
cache-dependency-path: frontend/package-lock.json
always-auth: false
check-latest: false
token: ***
Attempting to download 18...
Acquiring 18.20.8 - x64 from https://github.com/actions/node-versions/releases/download/18.20.8-14110393767/node-18.20.8-linux-x64.tar.gz
Extracting ...
/usr/bin/tar xz --strip 1 --warning=no-unknown-keyword --overwrite -C /home/runner/work/_temp/7a46ced7-091f-493c-99b7-de3b1f6e99a2 -f /home/runner/work/_temp/27c34949-bcf2-4208-b03a-009c69156be1
Adding to the cache ...
Environment details
node: v18.20.8
npm: 10.8.2
yarn: 1.22.22
/opt/hostedtoolcache/node/18.20.8/x64/bin/npm config get cache
/home/runner/.npm
Error: Some specified paths were not resolved, unable to cache dependencies.

## Goals

- [ ] Generate package-lock.json for Frontend
- [ ] Fix Template Placeholder in Test File
- [ ] Verify CI Workflow Configuration
- [ ] Run Local Tests to Verify Fix
- [ ] Run Type Checking
- [ ] Commit package-lock.json to Repository

## Non-goals

- [To be determined based on scope discussions]

## Requirements

- R1: Generate package-lock.json for Frontend (`package-lock.json`)
- R2: Fix Template Placeholder in Test File (`frontend/tests/hooks/useItems.test.tsx`)
- R3: Verify CI Workflow Configuration (`.github/workflows/ci.yml`)
- R4: Run Local Tests to Verify Fix
- R5: Run Type Checking
- R6: Commit package-lock.json to Repository (`package-lock.json`)

## Open Questions

- [Discovered during research - TBD]

## Implementation Notes

Now I have comprehensive understanding of the codebase. Let me create detailed research notes focusing on the frontend issue indicated in the error message.

# Research Notes: Frontend CI Tests Configuration Issue

## Facts

### Project Structure
- **Frontend Framework**: Expo-based React Native app with web support (frontend/package.json:5)
- **Language**: TypeScript with strict mode enabled (frontend/tsconfig.json:4)
- **Main Dependencies**:
  - React 19.1.0 + React Native 0.81.5 + Expo ~54.0.0
  - React Router 6.0.0 (expo-router) for navigation
  - TanStack React Query 5.0.0 for data fetching
  - Jest 29.7.0 + jest-expo 52.0.0 for testing
  - MSW 2.0.0 for API mocking
  - Testing Library React Native 12.4.0 + jest-native 5.4.3 for component testing

### CI Configuration - Root Level CI Pipeline
**File**: `.github/workflows/ci.yml` (lines 1-87)
- **Backend Job** (lines 10-47):
  - Python 3.11, uses pip for dependencies
  - Runs: ruff lint, mypy type check, pytest tests
  - Exports OpenAPI spec as artifact with 1-day retention
  
- **Frontend Job** (lines 49-87):
  - Depends on backend job completion (`needs: backend`)
  - Node.js version: `18` (lines 63)
  - **Cache configuration** (lines 64-65):
    ```yaml
    cache: 'npm'
    cache-dependency-path: frontend/package-lock.json
    ```
  - **Issue**: References `frontend/package-lock.json` which **does NOT exist** in the repository
  - **Downloads OpenAPI spec** from backend job artifact (lines 67-71)
  - **Runs**: `npm ci`, `npm run generate:api`, `npx tsc --noEmit`, `npm run lint --if-present`, `npm test -- --coverage`

### Frontend Package Configuration
**File**: `frontend/package.json` (lines 1-45)
- **Scripts defined** (lines 6-16):
  - `test`: "jest" - Run tests with default config
  - `test:watch`: "jest --watch"
  - `test:coverage`: "jest --coverage"
  - **No `lint` script defined** - CI calls `npm run lint --if-present` (which is no-op if not defined)
  - `tsc`: "tsc --noEmit"
  - `generate:api`: "openapi-ts" for API client generation

### Frontend Test Configuration
**File**: `frontend/jest.config.js` (lines 1-36)
- **Preset**: `jest-expo` - Configures Jest for React Native + Expo
- **Setup**: Runs `jest.setup.ts` before tests (line 9)
- **Transform ignore patterns** (lines 10-12): Whitelist of packages to not transform (comprehensive list for React Native modules)
- **Module name mapper** (lines 13-15): Maps `@/*` path alias to root directory
- **Coverage collection** (lines 17-25):
  - Targets: `components/**/*.{ts,tsx}`, `hooks/**/*.{ts,tsx}`, `services/**/*.{ts,tsx}`, `app/**/*.{ts,tsx}`
  - Excludes: `**/*.d.ts`, `**/node_modules/**`, `src/api/generated/**`
  - **Coverage thresholds** (lines 26-32): 70% for branches, functions, lines, statements globally
- **Test match patterns** (line 34): Discovers tests in `__tests__`, `tests`, or `*.test.ts[x]` files
- **Module extensions** (line 35): `ts, tsx, js, jsx, json, node`

**File**: `frontend/jest.setup.ts` (lines 1-30)
- **Testing Library setup** (line 9): `@testing-library/react-native/extend-expect`
- **MSW server setup** (lines 10-25):
  - Starts server before all tests with `onUnhandledRequest: 'warn'`
  - Resets handlers after each test
  - Closes server after all tests
- **Console error suppression** (line 29): Mocks `console.error` to suppress React Query dev mode warnings

### Test File Structure
**Test Files Located at**:
- `frontend/tests/components/Button.test.tsx` - Component tests
- `frontend/tests/hooks/useItems.test.tsx` - React Query hook tests  
- `frontend/tests/mocks/server.ts` - MSW server setup
- `frontend/tests/mocks/handlers.ts` - API mock handlers
- `frontend/tests/mocks/db.ts` - Mock database
- `frontend/tests/factories/items.ts` - Test data factories
- `frontend/tests/utils/test-utils.tsx` - Custom render function with providers

### MSW Mock Configuration
**File**: `frontend/tests/mocks/handlers.ts` (lines 1-89)
- **API Base URL**: `https://api.estatefox.example.com` (line 17)
- **Handlers**: GET/POST/PATCH/DELETE for items, plus health check
- **Server setup**: Uses `setupServer` from `msw/node` (frontend/tests/mocks/server.ts:12)

### Test Utilities
**File**: `frontend/tests/utils/test-utils.tsx` (lines 1-97)
- **QueryClient Setup** (lines 27-40):
  - `retry: false` - No retries in tests
  - `gcTime: 0` - Immediately garbage collect
  - `staleTime: 0` - Data immediately stale
- **Wrapper Provider** (lines 57-62): `QueryClientProvider` wrapping all tests
- **Custom render function** (lines 72-77): Re-exports with custom wrapper
- **Re-exports** (line 90): All React Testing Library exports

### CI Pipeline Flow
The root-level `.github/workflows/ci.yml` (lines 49-87) for frontend:
1. **Setup Node.js** with Node 18 and npm cache pointing to `frontend/package-lock.json`
2. **Download OpenAPI spec** - Artifact from backend job
3. **Install dependencies** - `npm ci` 
4. **Generate API types** - `npm run generate:api`
5. **Type check** - `npx tsc --noEmit`
6. **Lint** - `npm run lint --if-present` (currently no-op)
7. **Test** - `npm test -- --coverage`

## File Map

| File | Purpose | Key Items |
|------|---------|-----------|
| `.github/workflows/ci.yml:49-87` | Frontend CI job definition | Node 18, cache path, test steps |
| `frontend/package.json` | Frontend dependencies and scripts | jest, jest-expo, MSW, React Query |
| `frontend/jest.config.js:1-36` | Jest configuration | jest-expo preset, coverage thresholds (70%) |
| `frontend/jest.setup.ts:1-30` | Jest setup file | MSW server, Testing Library, console mocks |
| `frontend/tests/mocks/server.ts` | MSW server | HTTP request interception |
| `frontend/tests/mocks/handlers.ts:1-89` | API mock handlers | Items CRUD endpoints, health check |
| `frontend/tests/mocks/db.ts:1-72` | Mock database | In-memory data store with CRUD |
| `frontend/tests/utils/test-utils.tsx:1-97` | Test utilities | Custom render, QueryClient, re-exports |
| `frontend/tests/components/Button.test.tsx` | Component tests | Button rendering, onClick, disabled state |
| `frontend/tests/hooks/useItems.test.tsx:1-150` | Hook tests | useItems, useItem, useCreateItem, useDeleteItem |

## Invariants

- **Cache dependency path must exist**: The CI workflow specifies `cache-dependency-path: frontend/package-lock.json` but this file does NOT exist in the repository
- **All test imports must use test-utils**: Tests import `render, screen, fireEvent` from `tests/utils/test-utils.tsx` not directly from Testing Library
- **MSW server lifecycle**: Must call `server.listen()` before tests and `server.close()` after
- **Handler resets**: `server.resetHandlers()` must run after each test to clear runtime overrides
- **React Query test config**: Must use `gcTime: 0` and `staleTime: 0` to avoid cache persistence between tests
- **Coverage threshold**: Global minimum of 70% for branches, functions, lines, statements
- **Test data factories**: Use `createMockItem()` factory pattern instead of inline object literals
- **Mock database isolation**: Call `db.reset()` in test cleanup to prevent cross-test contamination

## Patterns

### Test Organization
- **Factory pattern**: `tests/factories/items.ts` provides `createMockItem()` and `createMockItems()` with override capability (frontend/tests/factories/items.ts:26-62)
- **Mock database pattern**: Centralized mock DB at `tests/mocks/db.ts` with CRUD operations and `reset()`method (frontend/tests/mocks/db.ts:28-72)
- **MSW handlers**: Exported as array from `tests/mocks/handlers.ts` for setup at line 13

### Provider Pattern
- **Custom render wrapper**: `AllTheProviders` component wraps tests with `QueryClientProvider` (frontend/tests/utils/test-utils.tsx:57-62)
- **Per-test QueryClient**: Fresh instance created before each test, cleared after (frontend/tests/utils/test-utils.tsx:45-51)
- **Query client configuration**: Aggressive cache clearing (`gcTime: 0`, `staleTime: 0`) for test isolation

### MSW API Mocking
- **Base URL constant**: `https://api.estatefox.example.com` defined at handler level (frontend/tests/mocks/handlers.ts:17)
- **Handler overrides**: Tests can override default handlers with `server.use()` pattern (frontend/tests/hooks/useItems.test.tsx:56-63)
- **Unhandled request warnings**: MSW configured to warn on unhandled requests (frontend/jest.setup.ts:14)

## Risks

### Critical Issues
1. **Missing package-lock.json**: The CI workflow at line 65 references `frontend/package-lock.json` which does NOT exist
   - **Impact**: NPM cache step fails with "Some specified paths were not resolved, unable to cache dependencies"
   - **Cause**: Repository uses npm but package-lock.json is not committed (likely in .gitignore)
   - **Solution**: Either commit package-lock.json or update cache-dependency-path in CI

2. **Package lock file location mismatch**: CI uses `cache-dependency-path: frontend/package-lock.json` but npm caching may be looking in root
   - **Impact**: GitHub Actions npm cache fails before dependencies are installed
   - **Cascade**: `npm ci` step may fail due to missing lock file consistency check

### Test Coverage Risks
3. **70% coverage threshold**: Jest coverage thresholds (jest.config.js:26-32) set to 70% globally
   - **Current implementation**: Tests exist for Button and useItems hook
   - **Risk**: Merge could fail if coverage drops below 70% after code changes
   - **Coverage excludes**: `src/api/generated/**` excluded, so API client types don't count

### Fixture/Setup Risks
4. **MSW server warnings**: Configured with `onUnhandledRequest: 'warn'` not `'error'`
   - **Impact**: Tests with unmatched requests will warn but still pass
   - **Risk**: Hard to catch when handlers don't match real API

5. **React Query test client**: Uses `retry: false` but mutations still have `retry: false`
   - **Impact**: One-off network failures will cause mutation failures, no resilience in tests
   - **Risk**: Flaky tests if MSW has issues

### Configuration Risks
6. **Transform ignore patterns length**: The transformIgnorePatterns regex (jest.config.js:10-12) is very long
   - **Risk**: Difficult to maintain, easy to miss new React Native packages
   - **Pattern**: Uses whitelist approach - any new package may need adding

7. **Openapi-ts generation**: Tests depend on `npm run generate:api` running successfully
   - **Risk**: If backend OpenAPI spec is malformed, frontend build fails
   - **Dependency**: Generated types in `src/api/generated/` (currently in .gitignore)

## Key Integration Points

1. **Backend → Frontend**: Backend CI exports OpenAPI spec as artifact (1-day retention) → Frontend downloads it (line 71) → Frontend generates types from it
2. **API Types**: Frontend uses `npm run generate:api` (openapi-ts) to auto-generate TypeScript types from OpenAPI spec (line 77, frontend/package.json:13)
3. **Test framework**: jest-expo preset handles React Native → web compilation for tests (frontend/jest.config.js:8)
4. **MSW mocking**: Intercepts all fetch/http calls in tests using handlers matching actual API routes (frontend/tests/mocks/handlers.ts)

---

## Root Cause Analysis: CI Cache Error

The error message from the issue indicates:
```
Error: Some specified paths were not resolved, unable to cache dependencies.
```

This occurs at the "Adding to the cache ..." step when:
- **Specified path**: `frontend/package-lock.json` (from `.github/workflows/ci.yml:65`)
- **Actual status**: File does NOT exist in repository
- **Result**: GitHub Actions npm cache cannot find the declared dependency file

The frontend/.gitignore (line 36) includes `node_modules/` and the package-lock.json is not in the repository. The CI workflow assumes it exists and tries to use it as the cache dependency marker. When npm cache step runs, it cannot find this file and fails.

---

**Summary**: The frontend tests infrastructure is well-designed with proper MSW mocking, test utilities, and React Query configuration. However, the CI workflow has a critical configuration error: it references a non-existent `package-lock.json` file in the npm cache setup step, causing the entire frontend CI job to fail before tests can even run.

## Implementation Plan

Now I have a complete picture. Let me write the implementation plan:

---

## Summary

The frontend CI tests are failing because the GitHub Actions workflow references `frontend/package-lock.json` for npm caching, but no `package-lock.json` file exists in the repository (and no yarn.lock or other lock files exist). The error "Some specified paths were not resolved, unable to cache dependencies" occurs because `actions/setup-node@v4` cannot find the specified cache dependency path. 

The fix requires two main changes:
1. **Generate and commit `package-lock.json`** - Run `npm install` in the frontend directory to generate the lock file and commit it to the repository
2. **Fix template placeholder in test file** - The test file `frontend/tests/hooks/useItems.test.tsx` has an unresolved cookiecutter template placeholder `{{ cookiecutter.api_base_url }}` that should be replaced with the actual API base URL (`https://api.estatefox.example.com`)

---

### Task 1: Generate package-lock.json for Frontend

- **Description**: Generate the `package-lock.json` file by running `npm install` in the frontend directory. This lock file is required for npm caching in GitHub Actions and ensures reproducible builds.
- **File(s)**: `frontend/package-lock.json` (new file to be generated)
- **Code**: 
  ```bash
  cd frontend
  npm install
  ```
  This will generate `package-lock.json` based on `package.json` dependencies.
- **Verification**: 
  - Verify the file exists: `ls frontend/package-lock.json`
  - Verify it's valid JSON: `head -20 frontend/package-lock.json`

---

### Task 2: Fix Template Placeholder in Test File

- **Description**: Replace the cookiecutter template placeholder `{{ cookiecutter.api_base_url }}` with the actual API base URL used in the codebase.
- **File(s)**: `frontend/tests/hooks/useItems.test.tsx`
- **Code**:
  Change line 57 from:
  ```typescript
  http.get('{{ cookiecutter.api_base_url }}/items', () => {
  ```
  To:
  ```typescript
  http.get('https://api.estatefox.example.com/items', () => {
  ```
- **Verification**: 
  - Grep for any remaining template placeholders: `grep -r "cookiecutter" frontend/`
  - Run tests: `cd frontend && npm test`

---

### Task 3: Verify CI Workflow Configuration

- **Description**: Verify the root CI workflow file properly references the package-lock.json path and all configuration is correct.
- **File(s)**: `.github/workflows/ci.yml`
- **Code**: The existing configuration at lines 64-65 is correct:
  ```yaml
  cache: 'npm'
  cache-dependency-path: frontend/package-lock.json
  ```
  No changes needed - the configuration is correct, it just needs the `package-lock.json` file to exist.
- **Verification**: Review the workflow file to confirm the cache configuration is correct

---

### Task 4: Run Local Tests to Verify Fix

- **Description**: Run the frontend test suite locally to ensure all tests pass before committing changes.
- **File(s)**: N/A (command execution)
- **Code**:
  ```bash
  cd frontend
  npm test -- --coverage --watchAll=false
  ```
- **Verification**: All tests should pass with exit code 0

---

### Task 5: Run Type Checking

- **Description**: Run TypeScript type checking to ensure the template placeholder fix doesn't introduce type errors.
- **File(s)**: N/A (command execution)
- **Code**:
  ```bash
  cd frontend
  npm run tsc
  ```
- **Verification**: TypeScript should exit with no errors

---

### Task 6: Commit package-lock.json to Repository

- **Description**: The `package-lock.json` file should be committed to version control to ensure CI can cache dependencies properly.
- **File(s)**: `frontend/package-lock.json`
- **Code**: Ensure `.gitignore` does NOT include `package-lock.json` (check both root and frontend `.gitignore` files)
- **Verification**: 
  - `git status` should show `frontend/package-lock.json` as a new file
  - `git diff frontend/.gitignore` should not exclude package-lock.json

---

### Testing Strategy

1. **Local Test Execution**:
   - Run `npm install` in frontend to generate `package-lock.json`
   - Run `npm test -- --coverage --watchAll=false` to verify all tests pass
   - Run `npm run tsc` to verify type checking passes

2. **CI Simulation**:
   Run the exact commands from `.github/workflows/ci.yml`:
   ```bash
   cd frontend
   npm ci
   npm run generate:api  # (requires openapi.json from backend)
   npx tsc --noEmit
   npm run lint --if-present
   npm test -- --coverage
   ```

3. **End-to-End Verification**:
   After pushing changes, verify the CI pipeline passes in GitHub Actions.

---

### Risks

1. **Package Version Lock-in**
   - **Risk**: Generating `package-lock.json` locally may use different npm or package versions than CI
   - **Mitigation**: CI uses Node.js 18, ensure local Node version matches. The lock file ensures consistent versions across environments.

2. **OpenAPI Type Generation in CI**
   - **Risk**: Frontend CI depends on `openapi.json` artifact from backend job. If backend changes break the spec, frontend tests will fail.
   - **Mitigation**: This is expected behavior - the CI is correctly sequencing backend before frontend.

3. **MSW Handler URL Mismatch**
   - **Risk**: The hardcoded API URL in handlers and tests must match the URL used in `services/api.ts`
   - **Mitigation**: All files use `https://api.estatefox.example.com` consistently. The fix uses this same URL.

4. **Lock File Merge Conflicts**
   - **Risk**: `package-lock.json` can cause merge conflicts when multiple developers update dependencies
   - **Mitigation**: This is a common issue with lock files. Use `npm ci` in CI and resolve conflicts by regenerating the lock file.

## Task List

- [ ] Generate package-lock.json for Frontend
- [ ] Fix Template Placeholder in Test File
- [ ] Verify CI Workflow Configuration
- [ ] Run Local Tests to Verify Fix
- [ ] Run Type Checking
- [ ] Commit package-lock.json to Repository

---
_Generated by SDLC Agent - OpenSpec Pattern_
