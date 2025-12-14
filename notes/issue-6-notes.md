Now I have comprehensive understanding of the codebase. Let me create detailed research notes:

---

# Research Notes: Backend CI Tests Failure

## Facts

### Project Structure
- **Backend Framework**: FastAPI application with Lambda handler via Mangum (src/estatefox_api/main.py:22-43)
- **Python Version**: 3.11+ required (backend/pyproject.toml:7)
- **Package Manager**: `uv` for dependency management
- **Test Framework**: pytest with pytest-asyncio (backend/pyproject.toml:19-20)

### Test Configuration
- **Test Location**: backend/tests/ directory with conftest.py, test_health.py, and test_items.py
- **pytest Configuration** (backend/pyproject.toml:52-54):
  - `asyncio_mode = "auto"` - Enables automatic async test detection
  - `testpaths = ["tests"]` - Test discovery path
- **Type Checking**: mypy in strict mode (backend/pyproject.toml:43-50)
  - `strict = true` - Enables all optional checks
  - `packages = ["estatefox_api"]` - Limited to source package

### Test Fixture Setup
- **Client Fixture** (backend/tests/conftest.py:9-12): Returns `TestClient(app)` from FastAPI
  - TestClient synchronously wraps async endpoints for testing
  - No parameters, injected into test methods via pytest dependency injection
- **Store Reset** (backend/tests/test_items.py:15-18): Autouse fixture calls `_reset_store()` before each test
  - Imported from src.estatefox_api.routes.items:148-150
  - Clears in-memory _items dictionary between tests

### Test Files Structure
**backend/tests/test_health.py:1-20**
- 2 tests for health check endpoint
- Tests use `client: TestClient` parameter (fixture injection)
- Validates response status 200, JSON structure with "status", "service", "environment" keys

**backend/tests/test_items.py:1-180**
- 5 test classes: TestCreateItem, TestListItems, TestGetItem, TestUpdateItem, TestDeleteItem
- Uses class-based test organization (pytest supports this)
- Autouse fixture `reset_items_store()` at module level (line 15-18)
- Tests validate CRUD operations with proper status codes (201 create, 200 read, 204 delete, 422 validation errors)

### API Routes Implementation
**Items Endpoint** (backend/src/estatefox_api/routes/items.py:1-150)
- All endpoints marked `async def` with FastAPI router
- In-memory store using dict[UUID, dict] (_items global, line 24)
- Functions: create_item (POST), list_items (GET), get_item (GET /{id}), update_item (PATCH), delete_item (DELETE)
- _reset_store() helper at line 148-150 for test cleanup

**Health Endpoint** (backend/src/estatefox_api/routes/health.py:10-17)
- Single endpoint: `async def health_check()` returning dict with status, service, environment

### Schema Pattern
- **BaseApiModel** (backend/src/estatefox_api/schemas/base.py:12-30):
  - Pydantic ConfigDict with `alias_generator=to_camel` for snake_case → camelCase conversion
  - `populate_by_name=True` allows both formats in requests
  - `from_attributes=True` for ORM compatibility
- **Item Schemas** (backend/src/estatefox_api/schemas/items.py):
  - ItemCreate: name (required, 1-100 chars), description (optional, max 500)
  - ItemUpdate: both fields optional
  - ItemResponse: includes id (UUID), created_at/updated_at timestamps
  - ItemListResponse: items list + total count

### CI Pipeline (backend/.github/workflows/ci.yml:1-47)
1. **Environment Setup**: Python 3.11, uv package manager (lines 17-25)
2. **Linting**: `uv run ruff check .` (line 31)
3. **Formatting**: `uv run ruff format --check .` (line 34)
4. **Type Checking**: `uv run mypy src/` (line 37)
5. **Tests**: `uv run pytest tests/ -v --cov=src/estatefox_api --cov-report=xml` (line 40)
6. **Coverage Upload**: codecov/codecov-action@v4 with coverage.xml (lines 42-46)

## File Map

| File | Purpose | Key Functions |
|------|---------|---------------|
| `backend/tests/conftest.py:9-12` | Test fixtures | `client()` - provides TestClient for tests |
| `backend/tests/test_health.py:1-20` | Health endpoint tests | `test_health_check()`, `test_health_check_returns_service_name()` |
| `backend/tests/test_items.py:1-180` | Items CRUD tests | 5 test classes covering all CRUD operations with 15+ test methods |
| `backend/src/estatefox_api/main.py:22-43` | FastAPI app | `app` (FastAPI instance), `handler` (Mangum Lambda wrapper) |
| `backend/src/estatefox_api/routes/items.py:1-150` | Items endpoints | `create_item()`, `list_items()`, `get_item()`, `update_item()`, `delete_item()`, `_reset_store()` |
| `backend/src/estatefox_api/routes/health.py:10-17` | Health endpoint | `health_check()` |
| `backend/src/estatefox_api/schemas/base.py:12-30` | Base schema class | `BaseApiModel` with camelCase conversion |
| `backend/src/estatefox_api/schemas/items.py:15-55` | Item schemas | `ItemCreate`, `ItemUpdate`, `ItemResponse`, `ItemListResponse` |
| `backend/src/estatefox_api/config.py:6-25` | Configuration | `Settings` class with environment variable loading |
| `backend/pyproject.toml:1-55` | Project config | pytest, mypy, ruff tool configuration |

## Invariants

- **All API responses must use Pydantic models, never raw dicts** (backend/CLAUDE.md:84)
- **All schemas must inherit from BaseApiModel** (backend/src/estatefox_api/schemas/base.py:12; backend/CLAUDE.md:28)
- **Field validation required with Field()** (backend/src/estatefox_api/schemas/items.py; backend/CLAUDE.md:76)
- **Explicit response_model on all routes** (backend/src/estatefox_api/routes/items.py; backend/CLAUDE.md:77)
- **HTTPException with specific status codes for errors** (backend/src/estatefox_api/routes/items.py:86-88, 111-113, 140-143)
- **Type hints required on all functions** (backend/pyproject.toml:43-50 strict mypy mode)
- **Test store must be reset between tests** (backend/tests/test_items.py:15-18 autouse fixture)
- **TestClient is synchronous wrapper** - conftest.py uses TestClient not AsyncClient
- **asyncio_mode = "auto"** must be set in pytest config (backend/pyproject.toml:53)

## Patterns

### Testing Pattern
- Fixture-based setup via conftest.py (backend/tests/conftest.py:9-12)
- Class-based test organization with self.client parameter (backend/tests/test_items.py:21-35)
- Autouse fixtures for setup/teardown (backend/tests/test_items.py:15-18)
- TestClient synchronously calls async endpoints (backend/tests/conftest.py:10-12)

### Schema Pattern
- BaseApiModel inheritance for all API schemas (backend/src/estatefox_api/schemas/items.py:15)
- Field() with validation constraints: min_length, max_length, description (backend/src/estatefox_api/schemas/items.py:21-24)
- Separate Create/Update/Response schemas (backend/src/estatefox_api/schemas/items.py:15-55)
- Snake_case field names in Python, auto-converted to camelCase in JSON (backend/src/estatefox_api/schemas/base.py:7-10)

### Route Pattern
- APIRouter with prefix and tags (backend/src/estatefox_api/routes/items.py:20)
- Explicit response_model on route decorators (backend/src/estatefox_api/routes/items.py:32-35)
- HTTPException with status_code and detail for errors (backend/src/estatefox_api/routes/items.py:86-88)
- Docstrings with Args, Returns, Raises sections (backend/src/estatefox_api/routes/items.py:39-45)

### CI/CD Pattern
- Python version pinned (3.11) in CI (backend/.github/workflows/ci.yml:20)
- uv package manager for dependency installation (backend/.github/workflows/ci.yml:28)
- Sequential checks: lint → format → type → test (backend/.github/workflows/ci.yml:30-40)
- Coverage report uploaded to codecov (backend/.github/workflows/ci.yml:42-46)

## Risks

### Test Isolation Risks
- **In-memory store persists across tests if reset fixture fails**: The global `_items` dict at backend/src/estatefox_api/routes/items.py:24 could cause test cross-contamination if _reset_store() doesn't execute properly or if autouse fixture fails
- **Class-based tests with self.client injection**: pytest fixture injection into class methods requires correct pytest-asyncio configuration; asyncio_mode="auto" is critical
- **No explicit setup/teardown in test classes**: Tests depend entirely on conftest.py client fixture and autouse reset_items_store() fixture

### Type Checking Risks
- **Strict mypy enforced** (backend/pyproject.toml:45): Any type annotations or unhandled exceptions will fail CI
- **packages = ["estatefox_api"]** in mypy config limits checking scope, may miss imports
- **mypy_path = "src"** requires proper package structure

### Schema Conversion Risks
- **BaseApiModel alias_generator with populate_by_name=True**: Must handle both snake_case and camelCase inputs correctly in tests
- **Field validation**: Tests at backend/tests/test_items.py:46-49 expect 422 status for empty name; validation must be strict

### Fixture Dependency Risks
- **TestClient from conftest not AsyncClient**: All async endpoints called via synchronous TestClient; any change to endpoint signatures could break tests
- **Fixture injection order**: client fixture required in test methods; autouse reset_items_store() fixture depends on correct pytest discovery