Perfect! Now I have enough information to write the research notes. Let me compile all the findings:

---

# Research Notes: Frontend Test CI Failure

## Facts

1. **CI Error Root Cause**: The frontend CI workflow at `.github/workflows/ci.yml` (lines 60-65) specifies `cache-dependency-path: frontend/package-lock.json`, but **no `package-lock.json` file exists in the frontend directory**. The error message states: "Error: Some specified paths were not resolved, unable to cache dependencies."

2. **Missing Lock File**: A search for `package-lock.json` files across the entire repository returns no results. The `.gitignore` file (line 36) ignores `node_modules/` but does not explicitly list `package-lock.json`.

3. **Frontend Package Configuration**: 
   - Frontend package.json exists at `/frontend/package.json` (1,349 bytes)
   - Root package.json exists at `/package.json` with monorepo scripts
   - Frontend uses npm as the package manager (evidenced by `npm ci` and `npm install` commands throughout the codebase)

4. **CI Workflow Configuration**:
   - Root CI workflow at `.github/workflows/ci.yml` runs both backend (Python) and frontend (Node.js) tests
   - Frontend CI job (lines 49-86) uses Node.js v18 with npm caching
   - The workflow expects `npm ci` to work (line 74), which requires a lockfile
   - Workflow also references downloading OpenAPI spec from backend artifact (lines 67-71)
   - Frontend workflow also exists at `frontend/.github/workflows/ci.yml` (lines 1-40) which uses Node v20 and doesn't specify a cache-dependency-path

5. **Test Infrastructure Details**:
   - Jest is configured with `jest-expo` preset (jest.config.js:8)
   - Test coverage threshold set to 70% for all metrics (jest.config.js:26-32)
   - Two test files exist:
     - `frontend/tests/components/Button.test.tsx` - Component tests with 7 test cases
     - `frontend/tests/hooks/useItems.test.tsx` - Hook tests with 10 test cases
   - MSW (Mock Service Worker) is configured for API mocking (jest.setup.ts:10-25)
   - Test utilities provide custom render with QueryClientProvider wrapper (tests/utils/test-utils.tsx)

6. **Frontend Package Scripts** (frontend/package.json:6-17):
   - `"test": "jest"` - Runs jest directly
   - `"test:watch": "jest --watch"` - Watch mode testing
   - `"test:coverage": "jest --coverage"` - Coverage report
   - No `lint` script defined in frontend package.json
   - Root package.json references `npm run lint:frontend` with `--if-present` flag (line 15), which will silently pass if no lint script exists

7. **Test Mocking Setup**:
   - MSW server configured in `tests/mocks/server.ts` using `setupServer` for Node environment
   - API handlers defined in `tests/mocks/handlers.ts` (lines 19-89) with routes to `https://api.estatefox.example.com`
   - Mock database in `tests/mocks/db.ts` provides CRUD operations for test data
   - Test factories in `tests/factories/items.ts` generate consistent mock data

8. **CI Workflow Mismatch**: 
   - Root `.github/workflows/ci.yml` (line 65) specifies Node v18
   - Frontend `.github/workflows/ci.yml` (line 20) specifies Node v20
   - Root workflow uses `npm test -- --coverage` (line 86)
   - Frontend standalone workflow uses `npm test -- --coverage --watchAll=false` (line 33)

## File Map

| File | Purpose | Key Functions/Tests |
|------|---------|-------------------|
| `frontend/package.json` | Frontend dependencies and scripts | `test`, `tsc`, `generate:api` |
| `.github/workflows/ci.yml` | Root monorepo CI orchestration | Runs backend → frontend tests sequentially |
| `frontend/.github/workflows/ci.yml` | Standalone frontend CI (currently unused) | Uses Node v20, no cache path specified |
| `frontend/jest.config.js` | Jest configuration for React Native testing | `jest-expo` preset, 70% coverage threshold |
| `frontend/jest.setup.ts` | Jest setup file executed before tests | MSW server lifecycle management |
| `frontend/tests/components/Button.test.tsx` | Component unit tests | 7 test cases for Button component |
| `frontend/tests/hooks/useItems.test.tsx` | React Query hook tests | 10 test cases for item CRUD operations |
| `frontend/tests/utils/test-utils.tsx` | Custom render function with providers | `customRender`, `getTestQueryClient` |
| `frontend/tests/mocks/server.ts` | MSW server setup for Node.js | `server` export for test lifecycle |
| `frontend/tests/mocks/handlers.ts` | API request interceptors | HTTP handlers for 6 endpoints |
| `frontend/tests/mocks/db.ts` | In-memory test database | Items store with CRUD operations |
| `frontend/tests/factories/items.ts` | Mock data factories | `createMockItem`, `createMockItems`, `resetItemCounter` |

## Invariants

- All test files must be discoverable by Jest test matcher pattern: `**/__tests__/**/*.[jt]s?(x)`, `**/tests/**/*.[jt]s?(x)`, `**/?(*.)+(spec|test).[jt]s?(x)` (jest.config.js:34)
- Coverage thresholds must be met: 70% for branches, functions, lines, and statements (jest.config.js:26-32)
- Test execution requires MSW server to be started in `beforeAll` and cleaned in `afterAll` (jest.setup.ts:13-25)
- Query client must be fresh for each test with retry disabled and immediate garbage collection (tests/utils/test-utils.tsx:27-40)
- `npm ci` must succeed, which requires a package-lock.json file in the frontend directory

## Patterns

- Jest with `jest-expo` preset for React Native/Expo compatibility
- MSW for API mocking at Node.js level (not browser-based)
- React Query with query key factory pattern for consistent cache invalidation (useItems.ts:62-69)
- Test utilities wrapper pattern providing providers to all rendered components
- Mock database with entity stores using Map-based in-memory storage
- Factory pattern for test data generation with sensible defaults and easy overrides
- BeforeEach/AfterEach hooks for test isolation (resetting db.items, QueryClient)

## Risks

1. **Critical Blocker**: Missing `package-lock.json` file causes npm caching to fail in CI, preventing `npm ci` from running properly. This is the immediate cause of the CI failure.

2. **Workflow Configuration Inconsistency**: Root CI workflow specifies Node v18 and cache-dependency-path to non-existent file, while standalone frontend workflow specifies Node v20 without cache-dependency-path. This causes the stated error with the root workflow's npm cache configuration.

3. **Test Commands Divergence**: Root CI runs `npm test -- --coverage` without `--watchAll=false`, while frontend CI specifies `--watchAll=false`. The `jest-expo` preset may have different watch behavior than standard Jest.

4. **Lint Script Missing**: Frontend package.json has no `lint` script defined. Root CI workflow attempts to run `npm run lint:frontend` which internally runs `npm run lint --if-present`. This silently passes but may mask linting issues that were intended to be checked.

5. **Type Checking Divergence**: Root CI uses `npx tsc --noEmit` (line 80), while frontend CI uses `npm run tsc` (line 30). The frontend package.json defines `tsc` script (line 12) which also runs `tsc --noEmit`, but this relies on `typescript` being available as a dependency.

6. **API URL Placeholder**: MSW handlers use placeholder API base URL `https://api.estatefox.example.com` (handlers.ts:17). The actual API client configuration in `services/api.ts` may have a different endpoint, causing mock-to-real mismatch in non-test scenarios.

7. **Test Data Isolation**: Tests reset counter and db state manually via `beforeEach` (useItems.test.tsx:19-22), but this pattern is not enforced globally. Some tests might pass due to execution order rather than proper isolation if factories are not reset.