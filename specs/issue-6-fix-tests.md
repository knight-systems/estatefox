# Fix tests - v1

**Issue:** #6
**Generated:** 2025-12-13 21:20
**Version:** 1

## Problem

The CI backend tests are failing -- let's fix them

## Goals

- [ ] Add pytest-cov to dev dependencies
- [ ] Fix import path in conftest.py
- [ ] Fix import path in test_items.py
- [ ] Run full test suite and verify CI workflow locally
- [ ] Fix line length in __init__.py
- [ ] Fix AsyncGenerator import in main.py
- [ ] Fix line length in main.py description
- [ ] Fix timezone.utc deprecation in items.py
- [ ] Add pytest-cov to dev dependencies
- [ ] Fix import path in conftest.py
- [ ] Fix import path in test_items.py
- [ ] Run full CI checks and verify all tests pass

## Non-goals

- [To be determined based on scope discussions]

## Requirements

- R1: Add pytest-cov to dev dependencies (``pyproject.toml`)
- R2: Fix import path in conftest.py (`conftest.py`)
- R3: Fix import path in test_items.py (`test_items.py`)
- R4: Run full test suite and verify CI workflow locally
- R5: Fix line length in __init__.py (`__init__.py`)
- R6: Fix AsyncGenerator import in main.py (`main.py`)
- R7: Fix line length in main.py description (`main.py`)
- R8: Fix timezone.utc deprecation in items.py (`items.py`)
- R9: Add pytest-cov to dev dependencies (``pyproject.toml`)
- R10: Fix import path in conftest.py (`conftest.py`)
- R11: Fix import path in test_items.py (`test_items.py`)
- R12: Run full CI checks and verify all tests pass

## Open Questions

- [Discovered during research - TBD]

## Implementation Notes

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

## Implementation Plan

Now I have all the information needed to update the plan. The ruff errors are:
1. `__init__.py` line 1: Line too long (103 > 100) - docstring
2. `main.py` line 4: `from typing import AsyncGenerator` should be `from collections.abc import AsyncGenerator`
3. `main.py` line 24: Line too long (116 > 100) - description string
4. `items.py` line 29: `timezone.utc` should be `datetime.UTC`

# Implementation Plan: Fix Backend Tests

## Summary

The CI backend tests are failing due to four issues:
1. **Ruff linting errors** - There are 4 ruff errors that need to be fixed before tests can run:
   - Line too long in `__init__.py` (103 > 100 characters)
   - Deprecated import `from typing import AsyncGenerator` in `main.py` (should use `collections.abc`)
   - Line too long in `main.py` description (116 > 100 characters)
   - Deprecated `timezone.utc` in `items.py` (should use `datetime.UTC`)
2. **Missing `pytest-cov` dependency** - The CI workflow runs coverage but `pytest-cov` is not in dev dependencies
3. **Incorrect import paths in test files** - Test files import from `src.estatefox_api` but should use `estatefox_api`

---

## Task 1: Fix line length in __init__.py

- **Description**: Shorten the docstring in `__init__.py` to be under 100 characters (currently 103)
- **File(s)**: `backend/src/estatefox_api/__init__.py`
- **Code**:
  Change:
  ```python
  """A full-stack real estate application for South Florida property listings, search, and management."""
  ```
  To:
  ```python
  """Real estate application for South Florida property listings, search, and management."""
  ```
- **Verification**: Run `uv run ruff check src/estatefox_api/__init__.py` to verify no E501 error

---

## Task 2: Fix AsyncGenerator import in main.py

- **Description**: Update the import to use `collections.abc` instead of `typing` per UP035 rule
- **File(s)**: `backend/src/estatefox_api/main.py`
- **Code**:
  Change:
  ```python
  from typing import AsyncGenerator
  ```
  To:
  ```python
  from collections.abc import AsyncGenerator
  ```
- **Verification**: Run `uv run ruff check src/estatefox_api/main.py` to verify no UP035 error

---

## Task 3: Fix line length in main.py description

- **Description**: Shorten the FastAPI description string to be under 100 characters (currently 116)
- **File(s)**: `backend/src/estatefox_api/main.py`
- **Code**:
  Change:
  ```python
  app = FastAPI(
      title="Estatefox API",
      description="A full-stack real estate application for South Florida property listings, search, and management.",
      version="0.1.0",
      lifespan=lifespan,
  )
  ```
  To:
  ```python
  app = FastAPI(
      title="Estatefox API",
      description="Real estate application for South Florida property listings and management.",
      version="0.1.0",
      lifespan=lifespan,
  )
  ```
- **Verification**: Run `uv run ruff check src/estatefox_api/main.py` to verify no E501 error

---

## Task 4: Fix timezone.utc deprecation in items.py

- **Description**: Update `timezone.utc` to use `datetime.UTC` alias per UP017 rule
- **File(s)**: `backend/src/estatefox_api/routes/items.py`
- **Code**:
  Change:
  ```python
  from datetime import datetime, timezone
  ```
  To:
  ```python
  from datetime import UTC, datetime
  ```
  And change:
  ```python
  def _now() -> datetime:
      """Get current UTC timestamp."""
      return datetime.now(timezone.utc)
  ```
  To:
  ```python
  def _now() -> datetime:
      """Get current UTC timestamp."""
      return datetime.now(UTC)
  ```
- **Verification**: Run `uv run ruff check src/estatefox_api/routes/items.py` to verify no UP017 error

---

## Task 5: Add pytest-cov to dev dependencies

- **Description**: Add the `pytest-cov` package to the dev dependencies in `pyproject.toml` to enable coverage reporting in CI
- **File(s)**: `backend/pyproject.toml`
- **Code**:
  ```toml
  [project.optional-dependencies]
  dev = [
      "pytest>=8.0.0",
      "pytest-asyncio>=0.23.0",
      "pytest-cov>=4.1.0",  # ADD THIS LINE
      "httpx>=0.26.0",
      "moto>=5.0.0",
      "uvicorn>=0.27.0",
      "mypy>=1.8.0",
      "ruff>=0.2.0",
      "boto3-stubs[bedrock-runtime,ses,s3]>=1.34.0",
  ]
  ```
- **Verification**: Run `uv sync` in the backend directory to ensure the dependency installs correctly

---

## Task 6: Fix import path in conftest.py

- **Description**: Update the import statement in `conftest.py` to use the correct package path `estatefox_api` instead of `src.estatefox_api`
- **File(s)**: `backend/tests/conftest.py`
- **Code**:
  Change:
  ```python
  from src.estatefox_api.main import app
  ```
  To:
  ```python
  from estatefox_api.main import app
  ```
- **Verification**: Run `uv run pytest tests/test_health.py -v` to verify the import works

---

## Task 7: Fix import path in test_items.py

- **Description**: Update the import statement in `test_items.py` to use the correct package path `estatefox_api` instead of `src.estatefox_api`
- **File(s)**: `backend/tests/test_items.py`
- **Code**:
  Change:
  ```python
  from src.estatefox_api.routes.items import _reset_store
  ```
  To:
  ```python
  from estatefox_api.routes.items import _reset_store
  ```
- **Verification**: Run `uv run pytest tests/test_items.py -v` to verify the import works

---

## Task 8: Run full CI checks and verify all tests pass

- **Description**: Execute the complete CI workflow locally to ensure all checks pass
- **File(s)**: N/A (command execution)
- **Code**:
  ```bash
  cd backend
  uv sync
  uv run ruff check .
  uv run ruff format --check .
  uv run mypy src/
  uv run pytest tests/ -v --cov=src/estatefox_api --cov-report=xml
  ```
- **Verification**: All commands should exit with status 0

---

## Testing Strategy

1. **Linting First**: Run ruff checks after Tasks 1-4 to ensure all linting errors are fixed:
   ```bash
   uv run ruff check .
   uv run ruff format --check .
   ```

2. **Type Checking**: Run mypy after linting passes:
   ```bash
   uv run mypy src/
   ```

3. **Unit Tests**: Run the existing test suite after making all fixes:
   - `uv run pytest tests/test_health.py -v` - Verify health endpoint tests
   - `uv run pytest tests/test_items.py -v` - Verify items CRUD tests
   - `uv run pytest tests/ -v --cov=src/estatefox_api` - Verify coverage works

4. **CI Simulation**: Run the exact commands from `.github/workflows/ci.yml` in order:
   ```bash
   uv run ruff check .
   uv run ruff format --check .
   uv run mypy src/
   uv run pytest tests/ -v --cov=src/estatefox_api --cov-report=xml
   ```

---

## Risks

1. **Ruff Auto-fixable vs Manual Fixes**
   - **Risk**: Some ruff errors are auto-fixable but we need to ensure they're fixed correctly
   - **Mitigation**: We're making targeted manual fixes to ensure consistency. Could optionally run `ruff check --fix .` but manual changes are more controlled.

2. **Description Text Changes**
   - **Risk**: Shortening the description may affect API documentation
   - **Mitigation**: The shortened descriptions still convey the essential information. The changes are minor and maintain the meaning.

3. **Import Path Consistency**
   - **Risk**: Other files might also use `src.estatefox_api` imports
   - **Mitigation**: Grepped the codebase and confirmed only the two test files use this pattern. The `export-openapi.py` script correctly uses `estatefox_api` after adding `src` to `sys.path`.

4. **Package Installation State**
   - **Risk**: Tests might fail if the package isn't installed in editable mode
   - **Mitigation**: The `uv sync` command should install the package correctly. If issues persist, ensure `uv pip install -e .` is run in the backend directory.

5. **pytest-cov Version Compatibility**
   - **Risk**: Version incompatibility with pytest 8.x
   - **Mitigation**: Using `pytest-cov>=4.1.0` which is compatible with pytest 8.x. This is a widely-used, stable combination.

6. **datetime.UTC Availability**
   - **Risk**: `datetime.UTC` was added in Python 3.11
   - **Mitigation**: The project likely targets Python 3.11+ based on modern type hints used. Verify in `pyproject.toml` that `requires-python >= "3.11"`.

## Task List

- [ ] Add pytest-cov to dev dependencies
- [ ] Fix import path in conftest.py
- [ ] Fix import path in test_items.py
- [ ] Run full test suite and verify CI workflow locally
- [ ] Fix line length in __init__.py
- [ ] Fix AsyncGenerator import in main.py
- [ ] Fix line length in main.py description
- [ ] Fix timezone.utc deprecation in items.py
- [ ] Add pytest-cov to dev dependencies
- [ ] Fix import path in conftest.py
- [ ] Fix import path in test_items.py
- [ ] Run full CI checks and verify all tests pass

---
_Generated by SDLC Agent - OpenSpec Pattern_
