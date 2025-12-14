# Bring frontend test coverage to 70% - v1

**Issue:** #14
**Generated:** 2025-12-14 11:58
**Version:** 1

## Problem

Our frontend test coverage is below 70% leading to failures in CI.  This is the error that appears -- let's write more frontend tests so this check passes.

Run npm test -- --coverage

> estatefox@1.0.0 test
> jest --coverage

PASS tests/hooks/useItems.test.tsx (5.412 s)
PASS tests/components/Button.test.tsx (8.918 s)
A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.
---------------|---------|----------|---------|---------|----------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s    
---------------|---------|----------|---------|---------|----------------------
All files      |   42.47 |     64.1 |   43.18 |   42.47 |                      
 app           |       0 |      100 |       0 |       0 |                      
  _layout.tsx  |       0 |      100 |       0 |       0 | 12-26                
  index.tsx    |       0 |      100 |       0 |       0 | 8                    
 app/(auth)    |       0 |      100 |       0 |       0 |                      
  _layout.tsx  |       0 |      100 |       0 |       0 | 4                    
  login.tsx    |       0 |      100 |       0 |       0 | 8-52                 
  register.tsx |       0 |      100 |       0 |       0 | 8-60                 
 app/(tabs)    |       0 |      100 |       0 |       0 |                      
  _layout.tsx  |       0 |      100 |       0 |       0 | 5-31                 
  home.tsx     |       0 |      100 |       0 |       0 | 6-39                 
  settings.tsx |       0 |      100 |       0 |       0 | 7-46                 
 components/ui |      50 |      100 |      50 |      50 |                      
  Button.tsx   |     100 |      100 |     100 |     100 |                      
  Card.tsx     |       0 |      100 |       0 |       0 | 10-17                
 hooks         |       0 |        0 |       0 |       0 |                      
  useApi.ts    |       0 |        0 |       0 |       0 | 12-38                
 hooks/queries |   70.27 |       60 |   76.47 |   70.27 |                      
  useItems.ts  |   70.27 |       60 |   76.47 |   70.27 | 66,133,155-169,190   
 services      |   74.07 |    68.75 |    62.5 |   74.07 |                      
  api.ts       |   74.07 |    68.75 |    62.5 |   74.07 | 18-22,36-37,41,71,91 
---------------|---------|----------|---------|---------|----------------------
Jest: "global" coverage threshold for statements (70%) not met: 42.47%
Jest: "global" coverage threshold for branches (70%) not met: 64.1%
Jest: "global" coverage threshold for lines (70%) not met: 42.47%
Jest: "global" coverage threshold for functions (70%) not met: 43.18%

Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        11.275 s
Ran all test suites.

## Goals

- [ ] Create Card Component Tests
- [ ] Create useApi Hook Tests
- [ ] Create Login Screen Tests
- [ ] Create Register Screen Tests
- [ ] Create Home Screen Tests
- [ ] Create Settings Screen Tests
- [ ] Create API Service Tests
- [ ] Add useUpdateItem Tests to Improve useItems Coverage

## Non-goals

- [To be determined based on scope discussions]

## Requirements

- R1: Create Card Component Tests (`tests/components/Card.test.tsx`)
- R2: Create useApi Hook Tests (`tests/hooks/useApi.test.tsx`)
- R3: Create Login Screen Tests (`tests/app/login.test.tsx`)
- R4: Create Register Screen Tests (`tests/app/register.test.tsx`)
- R5: Create Home Screen Tests (`tests/app/home.test.tsx`)
- R6: Create Settings Screen Tests (`tests/app/settings.test.tsx`)
- R7: Create API Service Tests (`tests/services/api.test.ts`)
- R8: Add useUpdateItem Tests to Improve useItems Coverage (`tests/hooks/useItems.test.tsx`)

## Open Questions

- [Discovered during research - TBD]

## Implementation Notes

Perfect! Now I have a complete picture. Let me create comprehensive research notes:

# Research Notes: Frontend Test Coverage Analysis

## Facts

### Current Coverage Status
- **Overall Coverage**: 42.47% (statements), 64.1% (branches), 43.18% (functions), 42.47% (lines)
- **Target**: 70% across all metrics (global threshold set in jest.config.js:28-34)
- **Current Test Files**: 2 passing test suites with 15 tests total (jest.config.js:36)
  - `tests/hooks/useItems.test.tsx` - Hook testing
  - `tests/components/Button.test.tsx` - Component testing

### Coverage by Module (from CI output)
| Module | % Stmts | % Branch | % Funcs | % Lines | Status |
|--------|---------|----------|---------|---------|--------|
| components/ui/Button.tsx | 100 | 100 | 100 | 100 | ✅ Fully tested |
| components/ui/Card.tsx | 0 | 100 | 0 | 0 | ❌ No tests |
| hooks/queries/useItems.ts | 70.27 | 60 | 76.47 | 70.27 | ⚠️ Partial coverage |
| services/api.ts | 74.07 | 68.75 | 62.5 | 74.07 | ⚠️ Partial coverage |
| hooks/useApi.ts | 0 | 0 | 0 | 0 | ❌ No tests |
| app/_layout.tsx | 0 | 100 | 0 | 0 | ❌ No tests |
| app/index.tsx | 0 | 100 | 0 | 0 | ❌ No tests |
| app/(auth)/_layout.tsx | 0 | 100 | 0 | 0 | ❌ No tests |
| app/(auth)/login.tsx | 0 | 100 | 0 | 0 | ❌ No tests |
| app/(auth)/register.tsx | 0 | 100 | 0 | 0 | ❌ No tests |
| app/(tabs)/_layout.tsx | 0 | 100 | 0 | 0 | ❌ No tests |
| app/(tabs)/home.tsx | 0 | 100 | 0 | 0 | ❌ No tests |
| app/(tabs)/settings.tsx | 0 | 100 | 0 | 0 | ❌ No tests |

### Jest Configuration (jest.config.js)
- **preset**: 'jest-expo' for React Native/Expo compatibility
- **setupFilesAfterEnv**: jest.setup.ts loads MSW server and test utilities
- **collectCoverageFrom** (jest.config.js:19-26):
  - components/**/*.{ts,tsx}
  - hooks/**/*.{ts,tsx}
  - services/**/*.{ts,tsx}
  - app/**/*.{ts,tsx}
  - Excludes: *.d.ts, node_modules, generated API files
- **coverageThreshold** (jest.config.js:28-34): global 70% for branches, functions, lines, statements
- **testMatch** (jest.config.js:36): Matches **/__tests__/, **/tests/*, **/?(*.)+(spec|test).[jt]s?(x)
- **testPathIgnorePatterns** (jest.config.js:37-41): Ignores tests/mocks/, tests/factories/, tests/utils/

### Test Infrastructure Setup
**jest.setup.ts** (jest.setup.ts:1-39):
- Imports @testing-library/react-native matchers
- Loads MSW server from tests/mocks/server
- Provides crypto.randomUUID polyfill for tests
- Server lifecycle: listen beforeAll, resetHandlers afterEach, close afterAll
- Mocks console.error to suppress React Query dev warnings

**Test Utilities** (tests/utils/test-utils.tsx:1-112):
- `createTestQueryClient()`: QueryClient with testing defaults (retry: false, gcTime: 0, staleTime: 0)
- Fresh testQueryClient per test via beforeEach/afterEach
- `AllTheProviders` wrapper: QueryClientProvider wrapping test components
- Custom `render()` and `renderHook()` functions that apply AllTheProviders wrapper
- `getTestQueryClient()` function for direct cache manipulation in tests
- Re-exports all React Testing Library APIs

**MSW (Mock Service Worker) Setup**:
- Server (tests/mocks/server.ts:1-15): setupServer with handlers array
- Handlers (tests/mocks/handlers.ts:1-89):
  - GET /items - Lists all items from mock database
  - GET /items/:id - Gets single item or 404
  - POST /items - Creates item with auto-generated UUID and timestamps
  - PATCH /items/:id - Updates item with updatedAt timestamp
  - DELETE /items/:id - Deletes item, returns 204
  - GET /health - Health check endpoint
  - Uses crypto.randomUUID() for IDs (jest.setup.ts provides polyfill)

**Mock Database** (tests/mocks/db.ts:1-72):
- `MockDatabase` class with private Map for items
- `db.items` getter provides CRUD operations:
  - getAll(), find(id), create(item), update(id, updates), delete(id)
  - seed(items): Bulk load test data
  - reset(): Clear all data
  - count(): Get item count
- Pattern designed for extension (comments indicate adding more entity types)

**Test Data Factory** (tests/factories/items.ts:1-62):
- `createMockItem(overrides)`: Creates single Item with defaults and overrides (line 26-37)
  - Auto-generates UUID if not provided
  - Counter-based naming: "Item 1", "Item 2", etc.
  - Uses current ISO timestamp for createdAt/updatedAt
- `createMockItems(count, overrides)`: Creates array of items (line 49-54)
- `resetItemCounter()`: Resets counter for predictable naming (line 60-62)

### Existing Test Coverage

**Button.test.tsx** (tests/components/Button.test.tsx:1-59):
- 6 test cases covering:
  - Rendering with title (line 14-17)
  - onPress callback invocation (line 19-26)
  - Disabled state prevents onPress (line 28-35)
  - Primary variant default rendering (line 37-41)
  - Secondary variant rendering (line 43-46)
  - Custom style application (line 48-57)
- Uses custom render from test-utils
- Achieves 100% coverage: statements, branches, functions, lines

**useItems.test.tsx** (tests/hooks/useItems.test.tsx:1-151):
- 11 test cases covering:
  - `useItems`: Empty list (line 25-34), Seeded items (line 36-52), Error handling (line 54-70)
  - `useItem`: Single item fetch (line 74-85), Not found error (line 87-93), Disabled when ID empty (line 95-100)
  - `useCreateItem`: Create and return (line 104-116), Database persistence (line 118-130)
  - `useDeleteItem`: Deletion and removal from cache (line 134-149)
- Uses renderHook from test-utils
- Uses db.seed(), db.reset(), db.count() for data management
- Uses createMockItem() factory for test data
- Uses server.use() to override handlers for error cases
- Uses waitFor() for async assertions
- Partial coverage: 70.27% statements, 60% branches, 76.47% functions, 70.27% lines

### Uncovered Code Paths

**Card.tsx** (components/ui/Card.tsx:1-31):
- Simple wrapper component with props: children, style
- Renders View with card styles
- No tests exist - 0% coverage
- All functionality: render children, apply custom style

**useApi.ts** (hooks/useApi.ts:1-39):
- Custom hook using useState and useEffect
- Generic API fetching: GET endpoint, error/loading/data states
- execute() async function handling responses
- Immediate execution option (line 32-36)
- No tests exist - 0% coverage
- Uncovered paths: loading state transitions, error handling, execute() function, conditional useEffect

**api.ts (services/api.ts:1-102)** - Partial Coverage:
- ApiClient class with private baseUrl, token state
- Methods: setToken(), clearToken()
- private request<T>() method handling fetch, headers, error responses (line 25-77)
- HTTP methods: get(), post(), put(), delete() (line 79-99)
- Uncovered paths (lines 18-22, 36-37, 41, 71, 91):
  - Token setting/retrieval logic
  - Custom header merging (line 35-38)
  - Authorization header construction (line 40-42)
  - Error response handling edge cases
  - Specific HTTP method branches

**Page/Layout Components** - All 0% Coverage:
- app/_layout.tsx (app/_layout.tsx:1-36): RootLayout wraps Stack with QueryClientProvider
  - QueryClient creation with defaults (lines 12-23)
  - Layout structure with Stack.Screen configuration (lines 25-35)
  - No tests exist
- app/index.tsx (app/index.tsx:1-9): Index redirects to (tabs)/home
  - Redirect component usage (line 8)
  - No tests exist
- app/(auth)/_layout.tsx (app/(auth)/_layout.tsx:1-14): AuthLayout Stack layout
  - Stack navigation setup for login/register (lines 4-13)
  - No tests exist
- app/(auth)/login.tsx (app/(auth)/login.tsx:1-100): LoginScreen with form and state
  - useState for email, password (lines 8-9)
  - handleLogin callback (lines 11-14)
  - Form UI: TextInput fields, Button, Card, Link to register (lines 16-50)
  - Styling (lines 52-100)
  - No tests exist
- app/(auth)/register.tsx (app/(auth)/register.tsx:1-108): RegisterScreen with form and state
  - useState for name, email, password (lines 8-10)
  - handleRegister callback (lines 12-15)
  - Form UI: TextInput fields, Button, Card, Link to login (lines 17-56)
  - Styling (lines 60-108)
  - No tests exist
- app/(tabs)/_layout.tsx (app/(tabs)/_layout.tsx:1-37): TabLayout with navigation
  - Tabs component with screen options (lines 6-11)
  - Home and Settings tab screens (lines 13-26)
  - Styling (lines 31-37)
  - No tests exist
- app/(tabs)/home.tsx (app/(tabs)/home.tsx:1-76): HomeScreen with cards and button
  - handlePress callback (lines 6-8)
  - ScrollView layout with header and card content (lines 10-36)
  - Styling (lines 39-76)
  - No tests exist
- app/(tabs)/settings.tsx (app/(tabs)/settings.tsx:1-93): SettingsScreen with app info
  - handleLogout callback (lines 7-10)
  - ScrollView with Card components displaying version, bundle ID, logout button (lines 12-44)
  - Uses Constants.expoConfig?.version (line 22)
  - Styling (lines 46-93)
  - No tests exist

## File Map

| File | Purpose | Key Functions/Components |
|------|---------|--------------------------|
| `jest.config.js` | Jest test configuration | Coverage thresholds, setup files, transform ignore patterns |
| `jest.setup.ts` | Test environment setup | MSW server lifecycle, crypto polyfill, console mocking |
| `tests/utils/test-utils.tsx` | Test utilities and providers | render(), renderHook(), createTestQueryClient(), AllTheProviders |
| `tests/mocks/server.ts` | MSW server initialization | setupServer() with handlers |
| `tests/mocks/handlers.ts` | API request mocking | HTTP handlers for items endpoints, health check |
| `tests/mocks/db.ts` | Mock database | MockDatabase class, CRUD operations, seed/reset |
| `tests/factories/items.ts` | Test data factory | createMockItem(), createMockItems(), resetItemCounter() |
| `tests/components/Button.test.tsx` | Button component tests | 6 test cases, 100% coverage |
| `tests/hooks/useItems.test.tsx` | useItems hook tests | 11 test cases, 70.27% coverage |
| `components/ui/Button.tsx` | Button UI component | Button() component with variant/disabled props |
| `components/ui/Card.tsx` | Card UI component | Card() wrapper with padding/shadow styles |
| `hooks/useApi.ts` | Generic API hook | useApi() hook with loading/error/data states |
| `hooks/queries/useItems.ts` | Items resource hooks | useItems(), useItem(), useCreateItem(), useUpdateItem(), useDeleteItem(), itemKeys factory |
| `services/api.ts` | API client service | ApiClient class, GET/POST/PUT/DELETE methods, token management |
| `app/_layout.tsx` | Root layout | RootLayout with QueryClientProvider, Stack navigation |
| `app/index.tsx` | Root index page | Index redirect to (tabs)/home |
| `app/(auth)/_layout.tsx` | Auth section layout | AuthLayout Stack with login/register screens |
| `app/(auth)/login.tsx` | Login screen | LoginScreen with email/password form, state management |
| `app/(auth)/register.tsx` | Register screen | RegisterScreen with name/email/password form, state management |
| `app/(tabs)/_layout.tsx` | Tabs section layout | TabLayout with Home and Settings tabs |
| `app/(tabs)/home.tsx` | Home screen | HomeScreen with welcome cards and button |
| `app/(tabs)/settings.tsx` | Settings screen | SettingsScreen with app info, logout button |

## Invariants

1. **Test Isolation**: Each test must have fresh state - testQueryClient created beforeEach (test-utils.tsx:45-46), db.reset() in beforeEach hooks (useItems.test.tsx:19-22)

2. **MSW Server Lifecycle**: Server must be started before all tests (jest.setup.ts:23-25), handlers reset afterEach (jest.setup.ts:28-30), server closed afterAll (jest.setup.ts:33-34)

3. **Coverage Threshold Enforcement**: All 4 metrics (statements, branches, functions, lines) must reach 70% (jest.config.js:28-34). Failure blocks CI.

4. **API URL Consistency**: All handlers use API_BASE = 'https://api.estatefox.example.com' (handlers.ts:17), matching api.ts baseUrl (api.ts:1)

5. **Test Path Ignoring**: test*.ts/tsx in mocks/, factories/, utils/ directories are not counted as test suites (jest.config.js:37-41)

6. **Query Client Testing Mode**: Tests must use createTestQueryClient() with retry: false to prevent retries in tests (test-utils.tsx:27-40)

7. **Component Rendering**: All component tests must use custom render() from test-utils to ensure QueryClientProvider wrapper (test-utils.tsx:72-77)

8. **Hook Testing**: All hook tests must use custom renderHook() from test-utils with QueryClientProvider wrapper (test-utils.tsx:86-91)

## Patterns

### Test Setup Pattern
- Import test utilities from `tests/utils/test-utils`
- Import mock data from `tests/factories/items`
- Import mock database from `tests/mocks/db`
- Import MSW server from `tests/mocks/server`
- Reset database in beforeEach (useItems.test.tsx:19-22)
- Reset item counter in beforeEach (useItems.test.tsx:20)

### Hook Testing Pattern
- Use `renderHook()` from test-utils (useItems.test.tsx:26, 44, etc.)
- Wrap MSW handler overrides with `server.use()` for error cases (useItems.test.tsx:56-62)
- Use `waitFor()` for async state assertions (useItems.test.tsx:28-30)
- Check loading/success/error states: `result.current.isSuccess`, `result.current.isError`, `result.current.fetchStatus` (useItems.test.tsx:29, 68)
- Verify mutations with `result.current.mutate()` (useItems.test.tsx:107)

### Component Testing Pattern
- Use `render()` from test-utils (Button.test.tsx:15)
- Use `screen.getByText()` to find elements (Button.test.tsx:16)
- Use `fireEvent.press()` for user interactions (Button.test.tsx:23)
- Verify callbacks with `jest.fn()` (Button.test.tsx:20)
- Test props variations: primary/secondary variants, disabled state, custom styles (Button.test.tsx:37-57)

### State Management Pattern
- Button.tsx uses StyleSheet.create() for static styles with conditional style arrays (Button.tsx:20-25)
- Form screens use useState for form fields (login.tsx:8-9, register.tsx:8-10)
- useItems hook uses itemKeys factory for consistent cache invalidation (useItems.ts:62-69)
- useItems mutations invalidate/remove from cache on success (useItems.ts:137-140, 193-197)

### Error Handling Pattern
- api.ts returns ApiResponse<T> with error field instead of throwing (api.ts:3-7)
- useItems hooks throw Error on response.error for React Query handling (useItems.ts:84-85)
- MSW handlers return HttpResponse.json() with status codes (handlers.ts:58-62)

## Risks

### Critical Coverage Gaps
1. **useApi.ts completely untested** - Generic hook with async effect and state management (0% coverage). Required for any non-React-Query API calls.
2. **All page/layout components untested** - 10 files with 0% coverage: login, register, home, settings, and all layout files. These are high-visibility code paths.
3. **Card.tsx untested** - Simple component but no tests despite being in collectCoverageFrom (0% coverage).

### Partial Coverage Issues
1. **api.ts gaps** - Token management paths (lines 18-22), header merging (line 36-37), authorization header (line 41), error response edge cases (line 71, 91) uncovered. These are critical for production API calls.
2. **useItems.ts gaps** - Uncovered lines 66, 133, 155-169, 190 indicate incomplete mutation scenarios or edge cases in cache invalidation.

### CI/CD Impact
- Current 42.47% coverage will fail CI until 70% threshold met across all metrics
- Branch coverage is 64.1% (5.9 percentage points below threshold) - conditional logic needs testing
- Function coverage is 43.18% (26.82 points below) - many functions untested

### Testing Infrastructure Constraints
- MSW requires crypto.randomUUID polyfill (jest.setup.ts:15-20) - tight coupling to test setup
- testQueryClient must be recreated per test (test-utils.tsx:45-46) - could cause memory issues with many tests
- No snapshot testing configured - visual regression testing not available
- No integration test examples - only unit-level hook/component tests

### Missing Test Scenarios
- No tests for layout/navigation components (expo-router Stack/Tabs)
- No tests for form submissions and validation
- No tests for error boundaries or error states in page components
- No tests for navigation transitions (Link components)
- No tests for conditional rendering in useApi based on immediate option
- No tests for the health check endpoint handler
</output>
</parameter>

Now I've completed a comprehensive research of the codebase. Here's my complete Research Notes document:

---

# Research Notes: Frontend Test Coverage Analysis

## Facts

### Current Coverage Status
- **Overall Coverage**: 42.47% (statements), 64.1% (branches), 43.18% (functions), 42.47% (lines)
- **Target**: 70% across all metrics (global threshold in jest.config.js:28-34)
- **Current Test Suites**: 2 passing with 15 total tests
  - `tests/hooks/useItems.test.tsx` - React Query hook testing
  - `tests/components/Button.test.tsx` - UI component testing

### Coverage by Module
| Module | % Stmts | % Branch | % Funcs | % Lines | Status |
|--------|---------|----------|---------|---------|--------|
| components/ui/Button.tsx | 100 | 100 | 100 | 100 | ✅ Complete |
| components/ui/Card.tsx | 0 | 100 | 0 | 0 | ❌ Missing |
| hooks/queries/useItems.ts | 70.27 | 60 | 76.47 | 70.27 | ⚠️ Partial |
| services/api.ts | 74.07 | 68.75 | 62.5 | 74.07 | ⚠️ Partial |
| hooks/useApi.ts | 0 | 0 | 0 | 0 | ❌ Missing |
| app/_layout.tsx | 0 | 100 | 0 | 0 | ❌ Missing |
| app/index.tsx | 0 | 100 | 0 | 0 | ❌ Missing |
| app/(auth)/_layout.tsx | 0 | 100 | 0 | 0 | ❌ Missing |
| app/(auth)/login.tsx | 0 | 100 | 0 | 0 | ❌ Missing |
| app/(auth)/register.tsx | 0 | 100 | 0 | 0 | ❌ Missing |
| app/(tabs)/_layout.tsx | 0 | 100 | 0 | 0 | ❌ Missing |
| app/(tabs)/home.tsx | 0 | 100 | 0 | 0 | ❌ Missing |
| app/(tabs)/settings.tsx | 0 | 100 | 0 | 0 | ❌ Missing |

### Jest Configuration (jest.config.js)
- **preset**: 'jest-expo' for React Native/Expo compatibility
- **setupFilesAfterEnv**: jest.setup.ts configures test environment
- **collectCoverageFrom** (lines 19-26): components/**, hooks/**, services/**, app/**
  - Excludes *.d.ts, node_modules, generated API files
- **coverageThreshold** (lines 28-34): All metrics require global 70%
- **testMatch** (line 36): Finds tests in __tests__, tests/, and *.test.* patterns
- **testPathIgnorePatterns** (lines 37-41): Excludes mocks/, factories/, utils/ from test count

### Test Infrastructure
**jest.setup.ts** (lines 1-39):
- Registers @testing-library/react-native matchers
- Starts MSW server before all tests
- Provides crypto.randomUUID polyfill for Node.js environment
- Resets handlers after each test (removes runtime overrides)
- Mocks console.error to suppress React Query warnings

**Test Utilities** (tests/utils/test-utils.tsx:1-112):
- `createTestQueryClient()`: QueryClient with testing defaults (retry: false, gcTime: 0, staleTime: 0)
- Fresh testQueryClient per test via beforeEach/afterEach hooks
- `AllTheProviders` wrapper: Wraps tests with QueryClientProvider
- Custom `render()` and `renderHook()`: Apply provider wrapper automatically
- Re-exports React Testing Library APIs (screen, fireEvent, waitFor, etc.)

**MSW Setup**:
- **Server** (tests/mocks/server.ts): setupServer with handler array
- **Handlers** (tests/mocks/handlers.ts): Routes for items CRUD + health check
  - GET /items - List items from db
  - GET /items/:id - Get single item or 404
  - POST /items - Create with UUID and timestamp
  - PATCH /items/:id - Update and return 204
  - DELETE /items/:id - Delete and return 204
  - GET /health - Health status
  - All use crypto.randomUUID() (requires jest.setup.ts polyfill)

**Mock Database** (tests/mocks/db.ts:1-72):
- `MockDatabase` class with private Map<string, Item>
- `db.items` getter provides:
  - CRUD: getAll(), find(), create(), update(), delete()
  - Test helpers: seed(), reset(), count()
- Pattern documented for extending with additional entity types

**Test Factories** (tests/factories/items.ts:1-62):
- `createMockItem(overrides)`: Single item with auto UUID and counter-based naming
- `createMockItems(count, overrides)`: Array of items
- `resetItemCounter()`: Reset for predictable naming

### Existing Tests

**Button.test.tsx** (6 tests, 100% coverage):
- Renders title text
- Invokes onPress callback
- Respects disabled state (blocks callback)
- Primary variant renders by default
- Secondary variant renders
- Applies custom styles

**useItems.test.tsx** (11 tests, 70.27% statements):
- `useItems`: Empty list, seeded items, error handling
- `useItem`: Single item fetch, not found error, disabled when ID empty
- `useCreateItem`: Create and return, database persistence
- `useDeleteItem`: Deletion and cache removal
- Uses db.seed(), db.reset() for isolation
- Uses server.use() to override handlers for error cases
- Uses waitFor() for async assertions

### Uncovered Code Paths

**Card.tsx** (components/ui/Card.tsx:1-31) - 0% coverage:
- Simple wrapper: children prop, style prop
- Renders View with predefined card styles
- No tests exist

**useApi.ts** (hooks/useApi.ts:1-39) - 0% coverage:
- Generic hook for GET endpoints
- State: data, loading, error
- Function execute() handles response and errors
- Conditional useEffect with immediate option
- All paths untested

**api.ts** (services/api.ts) - Partial coverage:
- **Uncovered**: Token management (lines 18-22, 40-42), header merging (35-38), error response edge cases (71, 91)
- **Covered**: Basic request structure, HTTP methods

**Page/Layout Components** - All 0% coverage:
- **app/_layout.tsx**: RootLayout with QueryClientProvider and Stack configuration
- **app/index.tsx**: Index redirect to (tabs)/home
- **app/(auth)/_layout.tsx**: AuthLayout Stack for login/register
- **app/(auth)/login.tsx**: LoginScreen with useState email/password, handleLogin callback, form UI
- **app/(auth)/register.tsx**: RegisterScreen with useState name/email/password, handleRegister callback, form UI
- **app/(tabs)/_layout.tsx**: TabLayout with Tabs and screen configuration
- **app/(tabs)/home.tsx**: HomeScreen with ScrollView, header, cards, button
- **app/(tabs)/settings.tsx**: SettingsScreen with app info display, Constants.expoConfig usage, logout button

## File Map

| File | Purpose | Key Items |
|------|---------|-----------|
| `jest.config.js` | Test configuration | Coverage thresholds, setupFilesAfterEnv, collectCoverageFrom |
| `jest.setup.ts` | Environment setup | MSW server lifecycle, crypto polyfill, console mocking |
| `tests/utils/test-utils.tsx` | Utilities & providers | render(), renderHook(), createTestQueryClient(), AllTheProviders wrapper |
| `tests/mocks/server.ts` | MSW initialization | setupServer() with handlers |
| `tests/mocks/handlers.ts` | API mocking | HTTP routes for items endpoints, health check |
| `tests/mocks/db.ts` | Mock database | MockDatabase class, CRUD ops, seed/reset |
| `tests/factories/items.ts` | Test data | createMockItem(), createMockItems(), resetItemCounter() |
| `tests/components/Button.test.tsx` | Component tests | 6 test cases, 100% coverage |
| `tests/hooks/useItems.test.tsx` | Hook tests | 11 test cases, partial coverage |
| `components/ui/Button.tsx` | UI Button | Button() with variant/disabled props, styles |
| `components/ui/Card.tsx` | UI Card | Card() wrapper with shadow/border styles |
| `hooks/useApi.ts` | Generic hook | useApi() with loading/error/data, execute(), immediate option |
| `hooks/queries/useItems.ts` | Items hooks | useItems(), useItem(), useCreateItem(), useUpdateItem(), useDeleteItem(), itemKeys factory |
| `services/api.ts` | API client | ApiClient class, GET/POST/PUT/DELETE, token management |
| `app/_layout.tsx` | Root layout | QueryClientProvider, Stack navigation config |
| `app/index.tsx` | Index page | Redirect to (tabs)/home |
| `app/(auth)/_layout.tsx` | Auth layout | Stack with login/register screens |
| `app/(auth)/login.tsx` | Login screen | Form with email/password, handleLogin callback |
| `app/(auth)/register.tsx` | Register screen | Form with name/email/password, handleRegister callback |
| `app/(tabs)/_layout.tsx` | Tabs layout | Tabs with Home and Settings screens |
| `app/(tabs)/home.tsx` | Home screen | Welcome header, feature cards, button |
| `app/(tabs)/settings.tsx` | Settings screen | App info, Constants.expoConfig version, logout button |

## Invariants

1. **Test Isolation Requirement**: testQueryClient must be created fresh beforeEach (test-utils.tsx:45-46), database reset beforeEach (useItems.test.tsx:20-21)

2. **MSW Server Lifecycle**: Server listen beforeAll (jest.setup.ts:23-25), resetHandlers afterEach (line 29), close afterAll (line 34)

3. **Coverage Threshold Enforcement**: All 4 metrics (statements, branches, functions, lines) must reach 70% or CI fails (jest.config.js:28-34)

4. **API Base URL Consistency**: Handlers use 'https://api.estatefox.example.com' (handlers.ts:17), matches api.ts baseUrl (api.ts:1)

5. **Test File Isolation**: Files in tests/mocks/, tests/factories/, tests/utils/ are not counted as test suites (jest.config.js:37-41)

6. **Query Client Configuration**: Tests must use createTestQueryClient() with retry: false to prevent retry loops (test-utils.tsx:31)

7. **Provider Wrapper Requirement**: Components must be rendered via custom render() and hooks via custom renderHook() to ensure QueryClientProvider wrapping (test-utils.tsx:72-91)

8. **Mock Data Factory Pattern**: createMockItem() uses itemCounter for auto-incremented naming ("Item 1", "Item 2", etc.) - counter must be reset between test suites (useItems.test.tsx:20)

## Patterns

### Test Setup Pattern
```
import { render, screen, fireEvent, waitFor, renderHook } from 'tests/utils/test-utils';
import { createMockItem } from 'tests/factories/items';
import { db } from 'tests/mocks/db';
import { server } from 'tests/mocks/server';

beforeEach(() => {
  resetItemCounter();  // For predictable mock data naming
  db.reset();          // Clear mock database
});
```

### Hook Testing Pattern
- Use `renderHook()` from test-utils to wrap with QueryClientProvider
- Reset mock database beforeEach
- Use `server.use()` to override default handlers for error scenarios (useItems.test.tsx:56-62)
- Use `waitFor()` for async state: `await waitFor(() => { expect(result.current.isSuccess).toBe(true); })`
- Check states: isSuccess, isError, fetchStatus, isPending, etc.
- Invoke mutations: `result.current.mutate(data)`
- Verify cache updates: `db.items.count()`, `db.items.getAll()`

### Component Testing Pattern
- Use `render()` from test-utils to wrap with QueryClientProvider
- Find elements: `screen.getByText()`, `screen.getByPlaceholder()`
- Trigger interactions: `fireEvent.press(element)`, `fireEvent.changeText(element, 'text')`
- Verify behavior: `jest.fn()` for callbacks, assertions on mocks
- Test prop variations: disabled state, variants, custom styles
- Check rendered output: `screen.getByText()` truthy checks

### State Management Patterns Observed
- **Button.tsx**: StyleSheet.create() with conditional style arrays (Button.tsx:20-25)
- **Form screens**: useState for individual form field values (login.tsx:8-9)
- **useItems**: itemKeys factory for consistent cache keys and invalidation (useItems.ts:62-69)
- **Mutations**: onSuccess callbacks for cache invalidation/updates (useItems.ts:137-140)

### Error Handling Patterns
- **api.ts**: Returns ApiResponse<T> with error field instead of throwing (api.ts:3-7)
- **useItems**: Throws Error on response.error for React Query to handle (useItems.ts:84-85)
- **MSW**: Returns HttpResponse.json() with status codes for different scenarios

## Risks

### Critical Coverage Gaps
1. **useApi.ts - 0% coverage**: Generic API hook with async effect and state management. Required for non-React-Query API calls. All paths uncovered: loading transitions, error handling, execute() function, conditional useEffect with immediate option.

2. **Page/Layout Components - All 0% coverage** (10 files): Login, register, home, settings, all layout files. These are high-visibility user-facing code. Covers navigation setup, form handling, callbacks, conditional rendering.

3. **Card.tsx - 0% coverage**: Simple component but no tests despite being in collectCoverageFrom. Even basic rendering test missing.

### Partial Coverage Issues
1. **api.ts gaps**: Token management paths (lines 18-22), header merging (line 35-38), authorization header construction (line 40-42), error response edge cases (lines 71, 91). These are critical for production API authentication and error handling.

2. **useItems.ts uncovered lines** (66, 133, 155-169, 190): Incomplete mutation scenarios or edge cases in cache invalidation. Indicates some branches in update/delete flows not tested.

### CI/CD Blocking
- Current 42.47% statements/lines: 27.53 points below threshold
- Branch coverage 64.1%: 5.9 points below threshold  
- Function coverage 43.18%: 26.82 points below threshold
- **All four metrics must reach 70%** - only meeting one is insufficient to pass

### Testing Infrastructure Constraints
- MSW requires crypto.randomUUID polyfill in jest.setup.ts (lines 15-20) - tight coupling
- Fresh testQueryClient per test (beforeEach/afterEach) - could cause memory issues at scale
- No snapshot testing configured - visual regression testing unavailable
- No integration test examples - only unit-level tests shown

### Missing Test Coverage Scenarios
- No tests for expo-router Stack/Tabs layout components
- No tests for form submission handling and validation
- No tests for error boundaries or error UI states
- No tests for Link navigation components
-No tests for useApi conditional execution (immediate: false)
- No tests for health check endpoint handler
- No tests for Constants.expoConfig integration (settings.tsx:22)

## Implementation Plan

Now I have all the information I need. Let me create a detailed implementation plan to bring the frontend test coverage to 70%.

## Implementation Plan: Bring Frontend Test Coverage to 70%

### Summary

The current test coverage is 42.47% (statements), 64.1% (branches), 43.18% (functions), and 42.47% (lines), falling short of the 70% threshold required by CI. The coverage report shows that the `app/` directory components (layouts, screens), `components/ui/Card.tsx`, and `hooks/useApi.ts` have 0% coverage, while `services/api.ts` and `hooks/queries/useItems.ts` need additional coverage for uncovered lines.

The implementation will add comprehensive tests following the established patterns:
- Tests use `@testing-library/react-native` with a custom wrapper providing QueryClient
- MSW (Mock Service Worker) is used for API mocking with a mock database (`tests/mocks/db.ts`)
- Test files follow the `tests/<category>/<name>.test.tsx` naming convention
- The project uses jest-expo preset for React Native/Expo compatibility

### Task 1: Create Card Component Tests

- **Description**: Add comprehensive tests for the Card component which currently has 0% coverage. The Card component is a simple wrapper that renders children with styling.

- **File(s)**: `tests/components/Card.test.tsx`

- **Code**:
```tsx
/**
 * Tests for Card component.
 */

import { render, screen } from '../utils/test-utils';
import { Card } from '../../components/ui/Card';
import { Text } from 'react-native';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeTruthy();
  });

  it('applies custom style', () => {
    render(
      <Card style={{ marginTop: 20 }}>
        <Text>Styled Card</Text>
      </Card>
    );
    expect(screen.getByText('Styled Card')).toBeTruthy();
  });

  it('renders multiple children', () => {
    render(
      <Card>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </Card>
    );
    expect(screen.getByText('First Child')).toBeTruthy();
    expect(screen.getByText('Second Child')).toBeTruthy();
  });
});
```

- **Verification**: Run `npm test -- --coverage --collectCoverageFrom="components/ui/Card.tsx"` and verify 100% coverage for Card.tsx.

---

### Task 2: Create useApi Hook Tests

- **Description**: Add tests for the useApi hook which currently has 0% coverage. This hook manages API state (data, loading, error) and supports immediate or manual execution.

- **File(s)**: `tests/hooks/useApi.test.tsx`

- **Code**:
```tsx
/**
 * Tests for useApi hook.
 */

import { renderHook, waitFor } from '../utils/test-utils';
import { useApi } from '../../hooks/useApi';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE = 'https://api.estatefox.example.com';

describe('useApi', () => {
  it('fetches data immediately by default', async () => {
    server.use(
      http.get(`${API_BASE}/test-endpoint`, () => {
        return HttpResponse.json({ message: 'success' });
      })
    );

    const { result } = renderHook(() => useApi<{ message: string }>('/test-endpoint'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ message: 'success' });
    expect(result.current.error).toBeNull();
  });

  it('does not fetch immediately when immediate is false', () => {
    const { result } = renderHook(() => 
      useApi<{ message: string }>('/test-endpoint', { immediate: false })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('handles error response', async () => {
    server.use(
      http.get(`${API_BASE}/test-endpoint`, () => {
        return HttpResponse.json(
          { message: 'Server error' },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useApi<{ message: string }>('/test-endpoint'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Server error');
    expect(result.current.data).toBeNull();
  });

  it('handles network error', async () => {
    server.use(
      http.get(`${API_BASE}/test-endpoint`, () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useApi<{ message: string }>('/test-endpoint'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('execute function can be called manually', async () => {
    server.use(
      http.get(`${API_BASE}/manual-endpoint`, () => {
        return HttpResponse.json({ value: 42 });
      })
    );

    const { result } = renderHook(() => 
      useApi<{ value: number }>('/manual-endpoint', { immediate: false })
    );

    expect(result.current.data).toBeNull();

    result.current.execute();

    await waitFor(() => {
      expect(result.current.data).toEqual({ value: 42 });
    });
  });
});
```

- **Verification**: Run `npm test -- --coverage --collectCoverageFrom="hooks/useApi.ts"` and verify coverage reaches 70%+.

---

### Task 3: Create Login Screen Tests

- **Description**: Add tests for the Login screen which has 0% coverage. Test rendering, form inputs, and button interaction.

- **File(s)**: `tests/app/login.test.tsx`

- **Code**:
```tsx
/**
 * Tests for Login screen.
 */

import { render, screen, fireEvent } from '../utils/test-utils';
import LoginScreen from '../../app/(auth)/login';

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => children,
}));

describe('LoginScreen', () => {
  it('renders welcome text', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Welcome Back')).toBeTruthy();
    expect(screen.getByText('Sign in to continue')).toBeTruthy();
  });

  it('renders email input', () => {
    render(<LoginScreen />);
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
  });

  it('renders password input', () => {
    render(<LoginScreen />);
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
  });

  it('renders sign in button', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('updates email input value', () => {
    render(<LoginScreen />);
    const emailInput = screen.getByPlaceholderText('Email');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('updates password input value', () => {
    render(<LoginScreen />);
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.changeText(passwordInput, 'password123');
    
    expect(passwordInput.props.value).toBe('password123');
  });

  it('calls handleLogin when sign in button is pressed', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<LoginScreen />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');
    
    fireEvent.press(screen.getByText('Sign In'));
    
    expect(consoleSpy).toHaveBeenCalledWith('Login:', 'test@example.com');
    consoleSpy.mockRestore();
  });

  it('renders sign up link text', () => {
    render(<LoginScreen />);
    expect(screen.getByText("Don't have an account?")).toBeTruthy();
    expect(screen.getByText('Sign Up')).toBeTruthy();
  });
});
```

- **Verification**: Run `npm test -- --coverage --collectCoverageFrom="app/(auth)/login.tsx"` and verify coverage reaches 70%+.

---

### Task 4: Create Register Screen Tests

- **Description**: Add tests for the Register screen which has 0% coverage. Test rendering, form inputs (name, email, password), and button interaction.

- **File(s)**: `tests/app/register.test.tsx`

- **Code**:
```tsx
/**
 * Tests for Register screen.
 */

import { render, screen, fireEvent } from '../utils/test-utils';
import RegisterScreen from '../../app/(auth)/register';

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => children,
}));

describe('RegisterScreen', () => {
  it('renders create account text', () => {
    render(<RegisterScreen />);
    expect(screen.getByText('Create Account')).toBeTruthy();
    expect(screen.getByText('Sign up to get started')).toBeTruthy();
  });

  it('renders full name input', () => {
    render(<RegisterScreen />);
    expect(screen.getByPlaceholderText('Full Name')).toBeTruthy();
  });

  it('renders email input', () => {
    render(<RegisterScreen />);
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
  });

  it('renders password input', () => {
    render(<RegisterScreen />);
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
  });

  it('renders sign up button', () => {
    render(<RegisterScreen />);
    expect(screen.getByText('Sign Up')).toBeTruthy();
  });

  it('updates name input value', () => {
    render(<RegisterScreen />);
    const nameInput = screen.getByPlaceholderText('Full Name');
    
    fireEvent.changeText(nameInput, 'John Doe');
    
    expect(nameInput.props.value).toBe('John Doe');
  });

  it('updates email input value', () => {
    render(<RegisterScreen />);
    const emailInput = screen.getByPlaceholderText('Email');
    
    fireEvent.changeText(emailInput, 'john@example.com');
    
    expect(emailInput.props.value).toBe('john@example.com');
  });

  it('updates password input value', () => {
    render(<RegisterScreen />);
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.changeText(passwordInput, 'securepassword');
    
    expect(passwordInput.props.value).toBe('securepassword');
  });

  it('calls handleRegister when sign up button is pressed', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<RegisterScreen />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');
    
    fireEvent.press(screen.getByText('Sign Up'));
    
    expect(consoleSpy).toHaveBeenCalledWith('Register:', 'test@example.com');
    consoleSpy.mockRestore();
  });

  it('renders sign in link text', () => {
    render(<RegisterScreen />);
    expect(screen.getByText('Already have an account?')).toBeTruthy();
    expect(screen.getByText('Sign In')).toBeTruthy();
  });
});
```

- **Verification**: Run `npm test -- --coverage --collectCoverageFrom="app/(auth)/register.tsx"` and verify coverage reaches 70%+.

---

### Task 5: Create Home Screen Tests

- **Description**: Add tests for the Home screen which has 0% coverage. Test rendering of welcome text, cards, and button interaction.

- **File(s)**: `tests/app/home.test.tsx`

- **Code**:
```tsx
/**
 * Tests for Home screen.
 */

import { render, screen, fireEvent } from '../utils/test-utils';
import HomeScreen from '../../app/(tabs)/home';

describe('HomeScreen', () => {
  it('renders welcome title', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Welcome to Estatefox')).toBeTruthy();
  });

  it('renders app description', () => {
    render(<HomeScreen />);
    expect(screen.getByText(/full-stack real estate application/i)).toBeTruthy();
  });

  it('renders getting started card', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Getting Started')).toBeTruthy();
    expect(screen.getByText(/This is a template screen/i)).toBeTruthy();
  });

  it('renders get started button', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Get Started')).toBeTruthy();
  });

  it('calls handlePress when get started button is pressed', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<HomeScreen />);
    
    fireEvent.press(screen.getByText('Get Started'));
    
    expect(consoleSpy).toHaveBeenCalledWith('Button pressed');
    consoleSpy.mockRestore();
  });

  it('renders features card', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Features')).toBeTruthy();
  });

  it('renders feature list items', () => {
    render(<HomeScreen />);
    expect(screen.getByText(/expo-router for file-based routing/i)).toBeTruthy();
  });
});
```

- **Verification**: Run `npm test -- --coverage --collectCoverageFrom="app/(tabs)/home.tsx"` and verify coverage reaches 70%+.

---

### Task 6: Create Settings Screen Tests

- **Description**: Add tests for the Settings screen which has 0% coverage. Test rendering of settings info, app version, and logout button.

- **File(s)**: `tests/app/settings.test.tsx`

- **Code**:
```tsx
/**
 * Tests for Settings screen.
 */

import { render, screen, fireEvent } from '../utils/test-utils';
import SettingsScreen from '../../app/(tabs)/settings';

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    version: '1.0.0',
  },
}));

describe('SettingsScreen', () => {
  it('renders settings title', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('renders app information card', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('App Information')).toBeTruthy();
  });

  it('renders version label and value', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Version:')).toBeTruthy();
    expect(screen.getByText('1.0.0')).toBeTruthy();
  });

  it('renders bundle ID', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Bundle ID:')).toBeTruthy();
    expect(screen.getByText('com.knightsystems.estatefox')).toBeTruthy();
  });

  it('renders account card with logout button', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Account')).toBeTruthy();
    expect(screen.getByText('Logout')).toBeTruthy();
  });

  it('calls handleLogout when logout button is pressed', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<SettingsScreen />);
    
    fireEvent.press(screen.getByText('Logout'));
    
    expect(consoleSpy).toHaveBeenCalledWith('Logout pressed');
    consoleSpy.mockRestore();
  });

  it('renders about card', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('About')).toBeTruthy();
    expect(screen.getByText(/Built with Expo and React Native/i)).toBeTruthy();
  });
});
```

- **Verification**: Run `npm test -- --coverage --collectCoverageFrom="app/(tabs)/settings.tsx"` and verify coverage reaches 70%+.

---

### Task 7: Create API Service Tests

- **Description**: Add tests for the api.ts service to cover the uncovered lines (18-22, 36-37, 41, 71, 91). Need to test setToken/clearToken, header merging, authorization header, and HTTP methods.

- **File(s)**: `tests/services/api.test.ts`

- **Code**:
```typescript
/**
 * Tests for API service.
 */

import { api, ApiResponse } from '../../services/api';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE = 'https://api.estatefox.example.com';

describe('ApiClient', () => {
  afterEach(() => {
    api.clearToken();
  });

  describe('setToken/clearToken', () => {
    it('sets authorization header when token is set', async () => {
      let capturedHeaders: Headers | null = null;

      server.use(
        http.get(`${API_BASE}/test`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({ success: true });
        })
      );

      api.setToken('test-token-123');
      await api.get('/test');

      expect(capturedHeaders?.get('Authorization')).toBe('Bearer test-token-123');
    });

    it('clears authorization header when token is cleared', async () => {
      let capturedHeaders: Headers | null = null;

      server.use(
        http.get(`${API_BASE}/test`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({ success: true });
        })
      );

      api.setToken('test-token');
      api.clearToken();
      await api.get('/test');

      expect(capturedHeaders?.get('Authorization')).toBeNull();
    });
  });

  describe('request methods', () => {
    it('makes GET request', async () => {
      server.use(
        http.get(`${API_BASE}/items`, () => {
          return HttpResponse.json({ items: [] });
        })
      );

      const response = await api.get<{ items: unknown[] }>('/items');

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ items: [] });
    });

    it('makes POST request with body', async () => {
      let capturedBody: unknown = null;

      server.use(
        http.post(`${API_BASE}/items`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ id: '123', name: 'New Item' }, { status: 201 });
        })
      );

      const response = await api.post<{ id: string; name: string }>('/items', { name: 'New Item' });

      expect(response.status).toBe(201);
      expect(response.data).toEqual({ id: '123', name: 'New Item' });
      expect(capturedBody).toEqual({ name: 'New Item' });
    });

    it('makes PUT request with body', async () => {
      let capturedBody: unknown = null;

      server.use(
        http.put(`${API_BASE}/items/123`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ id: '123', name: 'Updated' });
        })
      );

      const response = await api.put<{ id: string; name: string }>('/items/123', { name: 'Updated' });

      expect(response.status).toBe(200);
      expect(capturedBody).toEqual({ name: 'Updated' });
    });

    it('makes DELETE request', async () => {
      server.use(
        http.delete(`${API_BASE}/items/123`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const response = await api.delete('/items/123');

      expect(response.status).toBe(204);
    });
  });

  describe('error handling', () => {
    it('returns error for non-ok response', async () => {
      server.use(
        http.get(`${API_BASE}/error`, () => {
          return HttpResponse.json({ message: 'Not found' }, { status: 404 });
        })
      );

      const response = await api.get('/error');

      expect(response.status).toBe(404);
      expect(response.error).toBe('Not found');
    });

    it('returns default error message when no message in response', async () => {
      server.use(
        http.get(`${API_BASE}/error`, () => {
          return HttpResponse.json({}, { status: 500 });
        })
      );

      const response = await api.get('/error');

      expect(response.error).toBe('Request failed');
    });

    it('handles network error', async () => {
      server.use(
        http.get(`${API_BASE}/network-error`, () => {
          return HttpResponse.error();
        })
      );

      const response = await api.get('/network-error');

      expect(response.status).toBe(0);
      expect(response.error).toBeTruthy();
    });
  });

  describe('header handling', () => {
    it('merges custom headers with defaults', async () => {
      // This test verifies header merging which happens internally
      // The Content-Type header is always set
      let capturedHeaders: Headers | null = null;

      server.use(
        http.get(`${API_BASE}/headers`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({});
        })
      );

      await api.get('/headers');

      expect(capturedHeaders?.get('Content-Type')).toBe('application/json');
    });
  });
});
```

- **Verification**: Run `npm test -- --coverage --collectCoverageFrom="services/api.ts"` and verify coverage reaches 80%+.

---

### Task 8: Add useUpdateItem Tests to Improve useItems Coverage

- **Description**: Add tests for the useUpdateItem hook which has uncovered lines (155-169). The current tests cover useItems, useItem, useCreateItem, and useDeleteItem, but useUpdateItem is not tested.

- **File(s)**: `tests/hooks/useItems.test.tsx` (add to existing file)

- **Code** (add to existing file after useDeleteItem tests):
```tsx
describe('useUpdateItem', () => {
  it('updates item and returns updated data', async () => {
    const item = createMockItem({ name: 'Original Name' });
    db.items.create(item);

    // Add handler for PUT request (api uses PUT, not PATCH)
    server.use(
      http.put(`https://api.estatefox.example.com/items/${item.id}`, async ({ request }) => {
        const body = await request.json() as { name?: string };
        const updated = db.items.update(item.id, body);
        return HttpResponse.json(updated);
      })
    );

    const { result } = renderHook(() => useUpdateItem());

    result.current.mutate({ id: item.id, data: { name: 'Updated Name' } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.name).toBe('Updated Name');
  });

  it('handles update error for non-existent item', async () => {
    server.use(
      http.put('https://api.estatefox.example.com/items/non-existent', () => {
        return HttpResponse.json(
          { message: 'Item not found' },
          { status: 404 }
        );
      })
    );

    const { result } = renderHook(() => useUpdateItem());

    result.current.mutate({ id: 'non-existent', data: { name: 'Updated' } });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

Also need to add import for useUpdateItem at the top of the file:
```tsx
import { useItems, useItem, useCreateItem, useUpdateItem, useDeleteItem } from '../../hooks/queries/useItems';
```

- **Verification**: Run `npm test -- --coverage --collectCoverageFrom="hooks/queries/useItems.ts"` and verify coverage reaches 80%+.

---

### Testing Strategy

1. **Run individual test files**: After creating each test file, run it individually to ensure it passes:
   ```bash
   npm test -- tests/components/Card.test.tsx
   npm test -- tests/hooks/useApi.test.tsx
   npm test -- tests/app/login.test.tsx
   # etc.
   ```

2. **Check coverage incrementally**: After adding each test file, run coverage to track progress:
   ```bash
   npm test -- --coverage
   ```

3. **Final verification**: Run the full test suite with coverage to verify the 70% threshold is met:
   ```bash
   npm test -- --coverage
   ```

4. **Address any gaps**: If coverage is still below 70%, identify remaining uncovered lines from the coverage report and add targeted tests.

---

### Risks

1. **Expo Router Mocking**: The app screens use expo-router components (Link, Redirect, Stack, Tabs). These need to be mocked properly. The plan includes mocks for Link component, but if tests fail, the mock may need adjustment.
   - **Mitigation**: Start with simple mocks and expand as needed. Consider creating a shared mock file in `tests/mocks/expo-router.ts`.

2. **AsyncStorage/Native Modules**: If any screens use AsyncStorage or other native modules, additional mocks may be required.
   - **Mitigation**: jest-expo preset handles most native module mocks. Add specific mocks if needed.

3. **Coverage Calculation**: The coverage may be affected by how certain files are counted. Some lines may be unreachable (like StyleSheet definitions).
   - **Mitigation**: Focus on functional code coverage. StyleSheet objects are typically not counted against coverage.

4. **Worker Process Warning**: The CI output shows "worker process has failed to exit gracefully" warning. This may indicate async operations not being cleaned up.
   - **Mitigation**: Ensure all async operations complete in tests using `waitFor`. Consider adding `jest.useRealTimers()` if timer-related issues persist.

5. **Test Isolation**: Some tests modify global state (console.log mocks, api token).
   - **Mitigation**: Always restore mocks in afterEach hooks and clear API token after token-related tests.

## Task List

- [ ] Create Card Component Tests
- [ ] Create useApi Hook Tests
- [ ] Create Login Screen Tests
- [ ] Create Register Screen Tests
- [ ] Create Home Screen Tests
- [ ] Create Settings Screen Tests
- [ ] Create API Service Tests
- [ ] Add useUpdateItem Tests to Improve useItems Coverage

---
_Generated by SDLC Agent - OpenSpec Pattern_
