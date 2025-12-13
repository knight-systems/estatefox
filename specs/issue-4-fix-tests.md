# Fix tests - v1

**Issue:** #4
**Generated:** 2025-12-13 12:14
**Version:** 1

## Problem

The CI backend tests are failing -- let's fix them

## Goals

- [ ] Add pytest-cov to Dev Dependencies
- [ ] Run Linting Check
- [ ] Run Format Check
- [ ] Run Type Check
- [ ] Run Full Test Suite with Coverage
- [ ] Fix Pydantic v2 Config Pattern in config.py
- [ ] Add pytest-cov to Dev Dependencies
- [ ] Fix Line Too Long in __init__.py (E501)
- [ ] Fix Import and Line Length in main.py (UP035 & E501)
- [ ] Fix datetime.UTC Alias in items.py (UP017)
- [ ] Fix Pydantic v2 Config Pattern in config.py
- [ ] Add pytest-cov to Dev Dependencies

## Non-goals

- [To be determined based on scope discussions]

## Requirements

- R1: Add pytest-cov to Dev Dependencies (``pyproject.toml`)
- R2: Run Linting Check
- R3: Run Format Check
- R4: Run Type Check
- R5: Run Full Test Suite with Coverage (`test_health.py`)
- R6: Fix Pydantic v2 Config Pattern in config.py (`config.py`)
- R7: Add pytest-cov to Dev Dependencies (``pyproject.toml`)
- R8: Fix Line Too Long in __init__.py (E501) (``__init__.py`)
- R9: Fix Import and Line Length in main.py (UP035 & E501) (``main.py`)
- R10: Fix datetime.UTC Alias in items.py (UP017) (``items.py`)
- R11: Fix Pydantic v2 Config Pattern in config.py (``config.py`)
- R12: Add pytest-cov to Dev Dependencies (``pyproject.toml`)

## Open Questions

- [Discovered during research - TBD]

## Implementation Notes

Perfect! Now I have a complete understanding of the codebase. Let me create comprehensive research notes:

---

# Research Notes: CI Backend Tests

## Facts

### Test Infrastructure
- **CI Configuration**: Located at `backend/.github/workflows/ci.yml` (lines 1-47)
  - Runs on `ubuntu-latest` with Python 3.11
  - Uses `uv` package manager for dependency management
  - Pipeline executes: linting → formatting check → type checking → pytest → coverage upload
  - Test command: `uv run pytest tests/ -v --cov=src/estatefox_api --cov-report=xml` (line 40)

### Test Files
- **conftest.py** (lines 1-12): Provides `client` fixture using FastAPI TestClient
- **test_health.py** (lines 1-21): 2 tests for `/health` endpoint
  - Validates health status response format and service name
- **test_items.py** (lines 1-180): 13 tests organized in 5 test classes covering CRUD operations
  - TestCreateItem: 4 tests (success, minimal, validation, camelCase)
  - TestListItems: 2 tests (empty list, created items)
  - TestGetItem: 2 tests (success, 404 not found)
  - TestUpdateItem: 3 tests (success, partial updates, 404 not found)
  - TestDeleteItem: 2 tests (success, 404 not found)
  - Uses autouse fixture `reset_items_store()` to reset in-memory store before each test (line 15-18)

### Application Structure
- **main.py** (lines 1-43): FastAPI app setup with CORS middleware, route registration, Lambda handler via Mangum
- **health.py** (lines 1-17): GET `/health` endpoint returns dict with `status`, `service`, `environment` keys
- **items.py** (lines 1-150): Complete CRUD implementation with:
  - In-memory store: `_items: dict[UUID, dict]` (line 24)
  - 5 async endpoints: POST (create), GET (list), GET (get), PATCH (update), DELETE
  - Helper functions: `_now()` for UTC timestamps (lines 27-29), `_reset_store()` for test cleanup (lines 148-150)

### Schema Definitions
- **base.py** (lines 1-30): BaseApiModel with:
  - `alias_generator=to_camel` for snake_case → camelCase conversion (line 27)
  - `populate_by_name=True` to accept both formats in requests (line 28)
  - `from_attributes=True` for ORM compatibility (line 29)
- **items.py** (lines 1-56): Four schema classes
  - ItemCreate: `name` (required, 1-100 chars), `description` (optional, max 500 chars)
  - ItemUpdate: `name` (optional), `description` (optional)
  - ItemResponse: `id`, `name`, `description`, `created_at`, `updated_at`
  - ItemListResponse: `items` list and `total` count

### Configuration
- **config.py** (lines 1-25): Settings class with defaults
  - `service_name = "estatefox-api"` (line 12) - matches test expectation
  - `environment = "development"` (line 10)
  - `cors_origins = ["*"]` (line 18)

### Dependencies (pyproject.toml)
- Runtime: fastapi >= 0.109.0, pydantic >= 2.0.0, pyhumps >= 3.8.0 (camelCase conversion)
- Dev: pytest >= 8.0.0, pytest-asyncio >= 0.23.0, httpx >= 0.26.0, mypy >= 1.8.0, ruff >= 0.2.0
- **Pytest config**: `asyncio_mode = "auto"`, `testpaths = ["tests"]` (lines 50-51)
- **Mypy config**: `strict = true` (line 45)

### Test Patterns
- Tests use relative imports from `src.estatefox_api.*` (conftest.py line 6, test_items.py line 12)
- Response validation checks for specific fields: `data["status"]`, `data["service"]`, `data["createdAt"]` (camelCase)
- Tests validate HTTP status codes: 201 (create), 200 (success), 404 (not found), 204 (delete), 422 (validation error)
- Fixture-based test isolation: `reset_items_store()` clears state before each test via autouse

## File Map

| File | Purpose | Key Functions |
|------|---------|---------------|
| `backend/.github/workflows/ci.yml:40` | Test execution | `pytest tests/ -v --cov=...` |
| `backend/tests/conftest.py:9-12` | Test fixtures | `client()` fixture returns TestClient |
| `backend/tests/test_health.py:6-20` | Health endpoint tests | `test_health_check()`, `test_health_check_returns_service_name()` |
| `backend/tests/test_items.py:15-180` | CRUD endpoint tests | 5 test classes with 13 test methods |
| `backend/src/estatefox_api/main.py:22-43` | FastAPI app | `app` (FastAPI instance), `handler` (Lambda handler) |
| `backend/src/estatefox_api/routes/health.py:10-17` | Health endpoint | `health_check()` async function |
| `backend/src/estatefox_api/routes/items.py:32-144` | CRUD endpoints | `create_item()`, `list_items()`, `get_item()`, `update_item()`, `delete_item()` |
| `backend/src/estatefox_api/routes/items.py:148-150` | Test helper | `_reset_store()` clears in-memory state |
| `backend/src/estatefox_api/schemas/base.py:12-30` | Base schema | `BaseApiModel` with camelCase config |
| `backend/src/estatefox_api/schemas/items.py:15-56` | Item schemas | `ItemCreate`, `ItemUpdate`, `ItemResponse`, `ItemListResponse` |
| `backend/src/estatefox_api/config.py:6-25` | Settings | `Settings` class with defaults, `settings` singleton |

## Invariants

- **Service Name Invariant**: Health endpoint must return `"service": "estatefox-api"` (line 15 in health.py, expected by test line 20 in test_health.py)
- **Timestamp Format Invariant**: All timestamps use UTC timezone via `datetime.now(timezone.utc)` (items.py line 29)
- **Schema Naming Invariant**: All API schemas must inherit from `BaseApiModel` to ensure snake_case↔camelCase conversion
- **Response Model Contract**: All route endpoints must use explicit `response_model` parameter with Pydantic schemas
- **HTTP Status Codes Invariant**:
  - POST create: 201 Created (items.py line 35)
  - GET/PATCH success: 200 OK
  - DELETE success: 204 No Content (items.py line 127)
  - Not found: 404 Not Found (items.py line 87)
  - Validation error: 422 Unprocessable Entity (Pydantic default)
- **Test Isolation Invariant**: Items store must be reset before each test via `reset_items_store()` fixture (test_items.py line 15)
- **Validation Invariant**: Item name must have min_length=1, max_length=100 (schemas/items.py line 21)

## Patterns

### Schema Pattern
- All API models inherit from `BaseApiModel` which:
  - Automatically converts Python snake_case field names to JSON camelCase (via pyhumps)
  - Accepts both formats in request bodies (`populate_by_name=True`)
  - Supports ORM model conversion (`from_attributes=True`)
- Response schemas include server-generated fields: `id` (UUID), `created_at`, `updated_at` (datetime)

### Route Pattern
- Routes use FastAPI APIRouter with `prefix` and `tags` parameters (items.py line 20)
- All route handlers are async functions
- Request validation via Pydantic schemas passed as function parameters
- Explicit `response_model` on all endpoints (items.py lines 34, 60, 71, 93, 126)
- Error handling via `HTTPException` with appropriate status codes (items.py lines 86-88)

### Testing Pattern
- Test client created via TestClient(app) fixture in conftest.py
- Tests organized by endpoint in test classes
- Each test covers both success and error cases
- State isolation via autouse fixture that resets in-memory store
- JSON response validation via `response.json()` and field assertions

### Configuration Pattern
- Settings loaded from environment variables via pydantic-settings
- Environment variables prefixed with `APP_` (config.py line 21)
- Default values provided for all settings
- Settings singleton instantiated once: `settings = Settings()` (config.py line 25)

### Data Storage Pattern
- In-memory store using simple dict: `_items: dict[UUID, dict]` (items.py line 24)
- Each item stored as dict with keys: `id`, `name`, `description`, `created_at`, `updated_at`
- Items converted to Pydantic models for API responses via `ItemResponse(**item_data)` (items.py line 90)

## Risks

### Potential Test Failures
1. **Import Path Issues**: Tests import from `src.estatefox_api.*` (conftest.py line 6) - relies on Python path configuration or package installation via `uv sync`
2. **In-Memory State Leakage**: If `reset_items_store()` fixture isn't properly applied or if tests run out of order, state from previous tests could affect results
3. **Timezone Issues**: Tests may fail if system timezone differs from UTC expectations (items.py uses `timezone.utc`)
4. **Missing Dependencies**: Tests require pytest, pytest-asyncio, httpx - must be installed via `uv sync`

### Code Quality Risks
1. **Type Checking**: With `mypy strict = true` (pyproject.toml line 45), any untyped code will fail type checking
2. **Linting**: Ruff linting must pass (CI line 31) - code must follow configured rules
3. **Format Checking**: Code must match ruff format output exactly (CI line 34)

### Integration Risks
1. **In-Memory Store Not Thread-Safe**: Current `_items` dict implementation isn't thread-safe; concurrent requests could cause race conditions
2. **No Database Abstraction**: Tests assume in-memory store; migrating to real database would require significant refactoring
3. **Partial Update Logic**: The `exclude_unset=True` pattern (items.py line 117) requires careful Pydantic usage; breaking change in Pydantic v3 could cause issues

## Architecture Notes

### Test Coverage
- **13 total test methods** testing:
  - Health endpoint: format validation, service name constant
  - Create: success case, minimal fields, validation errors, schema flexibility
  - List: empty state, populated state, pagination metadata
  - Get: success case, 404 error
  - Update: full update, partial update, 404 error, field preservation
  - Delete: success case, 404 error

### Dependencies Between Tests
- All test classes depend on `client` fixture from conftest.py
- All test_items tests depend on `reset_items_store` autouse fixture
- Tests implicitly depend on correct import paths and package structure

### CI Pipeline Flow
1. Checkout code → Setup Python 3.11 → Install uv → Run `uv sync`
2. Lint with `ruff check .` → Format check with `ruff format --check .`
3. Type check with `mypy src/` → Run tests with `pytest tests/ -v --cov=...`
4. Upload coverage to Codecov

### Success Criteria
- All Python imports resolve correctly from `src/estatefox_api` package
- FastAPI app instantiates without errors
- TestClient can make requests to app
- All endpoints return correct status codes and response formats
- All fixtures run and clean up properly
- All assertions pass based on expected behavior

---

This research documents the current state of the backend test infrastructure. All components are present and properly configured for the test suite to run successfully.

## Implementation Plan

Now I have the complete picture. The user's feedback shows the **actual** ruff failures, which are different from what was speculated in the original plan. The original plan's Task 1 (config.py Pydantic fix) may still be valid (as it uses the deprecated pattern), but the four errors reported are:

1. **E501** in `__init__.py:1` - Line too long (103 > 100)
2. **UP035** in `main.py:4` - Import `AsyncGenerator` from `collections.abc` instead of `typing`
3. **E501** in `main.py:24` - Line too long (116 > 100)
4. **UP017** in `items.py:29` - Use `datetime.UTC` instead of `timezone.utc`

Let me provide the refined plan:

---

# Implementation Plan: Fix CI Backend Tests

## Summary

The CI backend tests are failing due to **ruff linting errors** that must be fixed. The user provided the exact errors from the CI run:

1. **E501**: Line too long in `__init__.py` (103 > 100 chars)
2. **UP035**: Import `AsyncGenerator` from `collections.abc` instead of `typing` in `main.py`
3. **E501**: Line too long in `main.py` (116 > 100 chars)
4. **UP017**: Use `datetime.UTC` alias instead of `timezone.utc` in `items.py`

Additionally, there's a potential issue with the `config.py` file using deprecated Pydantic v1 `class Config:` pattern that may cause issues, and `pytest-cov` is missing from dev dependencies (needed for CI coverage).

## Task 1: Fix Line Too Long in `__init__.py` (E501)

- **Description**: The docstring on line 1 is 103 characters, exceeding the 100 character limit. Split it across multiple lines.

- **File**: `/Users/marcknight/Dropbox/web-projects/agent-platform/trees/dc066572/backend/src/estatefox_api/__init__.py`

- **Code**:
  
  Change from:
  ```python
  """A full-stack real estate application for South Florida property listings, search, and management."""

  __version__ = "0.1.0"
  ```
  
  To:
  ```python
  """A full-stack real estate application for South Florida property listings.

  Features property search and management capabilities.
  """

  __version__ = "0.1.0"
  ```

- **Verification**: Run `uv run ruff check src/estatefox_api/__init__.py`

## Task 2: Fix Import and Line Length in `main.py` (UP035 & E501)

- **Description**: Fix two issues in `main.py`:
  1. Import `AsyncGenerator` from `collections.abc` instead of `typing` (UP035)
  2. Shorten the description string that exceeds 100 characters (E501)

- **File**: `/Users/marcknight/Dropbox/web-projects/agent-platform/trees/dc066572/backend/src/estatefox_api/main.py`

- **Code**:
  
  Change from:
  ```python
  """FastAPI application entrypoint with Lambda handler."""

  from contextlib import asynccontextmanager
  from typing import AsyncGenerator

  from fastapi import FastAPI
  from fastapi.middleware.cors import CORSMiddleware
  from mangum import Mangum

  from .config import settings
  from .routes import health, items


  @asynccontextmanager
  async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
      """Application lifespan handler for startup/shutdown events."""
      # Startup
      yield
      # Shutdown


  app = FastAPI(
      title="Estatefox API",
      description="A full-stack real estate application for South Florida property listings, search, and management.",
      version="0.1.0",
      lifespan=lifespan,
  )
  ```
  
  To:
  ```python
  """FastAPI application entrypoint with Lambda handler."""

  from collections.abc import AsyncGenerator
  from contextlib import asynccontextmanager

  from fastapi import FastAPI
  from fastapi.middleware.cors import CORSMiddleware
  from mangum import Mangum

  from .config import settings
  from .routes import health, items


  @asynccontextmanager
  async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
      """Application lifespan handler for startup/shutdown events."""
      # Startup
      yield
      # Shutdown


  app = FastAPI(
      title="Estatefox API",
      description="Real estate application for South Florida property listings and management.",
      version="0.1.0",
      lifespan=lifespan,
  )
  ```

- **Verification**: Run `uv run ruff check src/estatefox_api/main.py`

## Task 3: Fix datetime.UTC Alias in `items.py` (UP017)

- **Description**: Replace `timezone.utc` with `datetime.UTC` alias as required by pyupgrade rules. This means changing the import and usage.

- **File**: `/Users/marcknight/Dropbox/web-projects/agent-platform/trees/dc066572/backend/src/estatefox_api/routes/items.py`

- **Code**:
  
  Change line 13 from:
  ```python
  from datetime import datetime, timezone
  ```
  
  To:
  ```python
  from datetime import UTC, datetime
  ```
  
  And change lines 27-29 from:
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

- **Verification**: Run `uv run ruff check src/estatefox_api/routes/items.py`

## Task 4: Fix Pydantic v2 Config Pattern in `config.py`

- **Description**: Update `config.py` to use Pydantic v2's `model_config = SettingsConfigDict(...)` pattern instead of the deprecated `class Config:` inner class. While this wasn't in the reported errors, it uses deprecated syntax that ruff's UP rules flag.

- **File**: `/Users/marcknight/Dropbox/web-projects/agent-platform/trees/dc066572/backend/src/estatefox_api/config.py`

- **Code**:
  
  Change from:
  ```python
  """Application configuration via environment variables."""

  from pydantic_settings import BaseSettings


  class Settings(BaseSettings):
      """Application settings loaded from environment variables."""

      # Application
      environment: str = "development"
      debug: bool = False
      service_name: str = "estatefox-api"

      # AWS
      aws_region: str = "us-east-1"

      # CORS
      cors_origins: list[str] = ["*"]

      class Config:
          env_prefix = "APP_"
          case_sensitive = False


  settings = Settings()
  ```
  
  To:
  ```python
  """Application configuration via environment variables."""

  from pydantic_settings import BaseSettings, SettingsConfigDict


  class Settings(BaseSettings):
      """Application settings loaded from environment variables."""

      # Application
      environment: str = "development"
      debug: bool = False
      service_name: str = "estatefox-api"

      # AWS
      aws_region: str = "us-east-1"

      # CORS
      cors_origins: list[str] = ["*"]

      model_config = SettingsConfigDict(
          env_prefix="APP_",
          case_sensitive=False,
      )


  settings = Settings()
  ```

- **Verification**: Run `uv run ruff check src/estatefox_api/config.py`

## Task 5: Add pytest-cov to Dev Dependencies

- **Description**: Add the `pytest-cov` package to the dev dependencies in `pyproject.toml` to enable coverage reporting in the CI pipeline.

- **File**: `/Users/marcknight/Dropbox/web-projects/agent-platform/trees/dc066572/backend/pyproject.toml`

- **Code**:
  
  Change:
  ```toml
  [project.optional-dependencies]
  dev = [
      "pytest>=8.0.0",
      "pytest-asyncio>=0.23.0",
      "httpx>=0.26.0",
  ```
  
  To:
  ```toml
  [project.optional-dependencies]
  dev = [
      "pytest>=8.0.0",
      "pytest-asyncio>=0.23.0",
      "pytest-cov>=4.1.0",
      "httpx>=0.26.0",
  ```

- **Verification**:
  1. Run `uv sync` in the backend directory to install the new dependency
  2. Run `uv run pytest tests/ -v --cov=src/estatefox_api --cov-report=xml` to verify coverage works

## Task 6: Run Full CI Pipeline Locally

- **Description**: Run all CI checks locally to ensure the complete pipeline passes before pushing.

- **File(s)**: All Python files in `/Users/marcknight/Dropbox/web-projects/agent-platform/trees/dc066572/backend/`

- **Code**: No changes expected (diagnostic task)

- **Verification**:
  Run the complete CI pipeline locally in sequence:
  ```bash
  cd /Users/marcknight/Dropbox/web-projects/agent-platform/trees/dc066572/backend
  uv sync
  uv run ruff check .
  uv run ruff format --check .
  uv run mypy src/
  uv run pytest tests/ -v --cov=src/estatefox_api --cov-report=xml
  ```
  All commands should pass without errors.

## Testing Strategy

1. **Local Linting Verification**:
   - After each file change, run `uv run ruff check <file>` to verify the specific error is fixed
   - Run `uv run ruff check .` to verify no new errors are introduced

2. **Full CI Pipeline Locally**:
   ```bash
   cd /Users/marcknight/Dropbox/web-projects/agent-platform/trees/dc066572/backend
   uv sync
   uv run ruff check .           # Should pass after Tasks 1-4
   uv run ruff format --check .  # Should pass (formatting not changed)
   uv run mypy src/              # Should pass (type changes are compatible)
   uv run pytest tests/ -v --cov=src/estatefox_api --cov-report=xml  # Works with pytest-cov from Task 5
   ```

3. **CI Pipeline Verification**:
   - Push changes to a branch
   - Create a PR targeting main
   - Verify all CI steps pass:
     - Install dependencies
     - Run linting ✓ (fixed by Tasks 1-4)
     - Run formatting check
     - Run type checking
     - Run tests with coverage ✓ (fixed by Task 5)

## Risks

1. **datetime.UTC Compatibility**:
   - **Risk**: `datetime.UTC` was added in Python 3.11. If the project supports Python < 3.11, this will fail.
   - **Mitigation**: Check `pyproject.toml` for Python version requirements. If < 3.11 is supported, use `from datetime import timezone` and `timezone.utc` with a ruff ignore comment, or update the minimum Python version.

2. **Import Order Changes**:
   - **Risk**: Changing `from typing import AsyncGenerator` to `from collections.abc import AsyncGenerator` might affect import order rules.
   - **Mitigation**: Place `collections.abc` import before `contextlib` to maintain alphabetical order in standard library imports, or let ruff format fix it.

3. **Description Text Changes**:
   - **Risk**: Shortening the FastAPI description changes API documentation.
   - **Mitigation**: The new description "Real estate application for South Florida property listings and management." preserves the essential meaning while staying under 100 characters.

4. **pytest-cov Version**:
   - **Risk**: `pytest-cov>=4.1.0` may have compatibility issues with `pytest>=8.0.0`
   - **Mitigation**: The specified version ranges are compatible. pytest-cov 4.1.0+ supports pytest 8.x.

5. **uv.lock Changes**:
   - **Risk**: Adding a new dependency will modify `uv.lock`
   - **Mitigation**: This is expected behavior. The lock file should be committed to ensure reproducible builds.

## Task List

- [ ] Add pytest-cov to Dev Dependencies
- [ ] Run Linting Check
- [ ] Run Format Check
- [ ] Run Type Check
- [ ] Run Full Test Suite with Coverage
- [ ] Fix Pydantic v2 Config Pattern in config.py
- [ ] Add pytest-cov to Dev Dependencies
- [ ] Fix Line Too Long in __init__.py (E501)
- [ ] Fix Import and Line Length in main.py (UP035 & E501)
- [ ] Fix datetime.UTC Alias in items.py (UP017)
- [ ] Fix Pydantic v2 Config Pattern in config.py
- [ ] Add pytest-cov to Dev Dependencies

---
_Generated by SDLC Agent - OpenSpec Pattern_
