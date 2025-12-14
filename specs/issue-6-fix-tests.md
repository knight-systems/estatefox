# Fix tests - v1

**Issue:** #6
**Generated:** 2025-12-13 19:25
**Version:** 1

## Problem

The CI backend tests are failing -- let's fix them

## Goals

- [ ] Fix the Import Path in conftest.py
- [ ] Fix the Import Path in test_items.py
- [ ] Verify All Tests Pass
- [ ] Verify CI Pipeline Configuration Matches Local Testing
- [ ] Fix Line Length in __init__.py
- [ ] Fix Deprecated Import in main.py
- [ ] Fix Line Length in main.py
- [ ] Fix Deprecated timezone.utc in items.py
- [ ] Verify All Linting and Tests Pass
- [ ] Fix Line Length in __init__.py
- [ ] Fix Deprecated Import in main.py
- [ ] Fix Line Length in main.py
- [ ] Fix Deprecated timezone.utc in items.py
- [ ] Add Missing pytest-cov Dependency

## Non-goals

- [To be determined based on scope discussions]

## Requirements

- R1: Fix the Import Path in conftest.py (`conftest.py`)
- R2: Fix the Import Path in test_items.py (`test_items.py`)
- R3: Verify All Tests Pass
- R4: Verify CI Pipeline Configuration Matches Local Testing (``.github/workflows/ci.yml`)
- R5: Fix Line Length in __init__.py (``__init__.py`)
- R6: Fix Deprecated Import in main.py (``main.py`)
- R7: Fix Line Length in main.py (``main.py`)
- R8: Fix Deprecated timezone.utc in items.py (`timezone.utc`)
- R9: Verify All Linting and Tests Pass
- R10: Fix Line Length in __init__.py (``__init__.py`)
- R11: Fix Deprecated Import in main.py (``main.py`)
- R12: Fix Line Length in main.py (``main.py`)
- R13: Fix Deprecated timezone.utc in items.py (`timezone.utc`)
- R14: Add Missing pytest-cov Dependency (``pyproject.toml`)

## Open Questions

- [Discovered during research - TBD]

## Implementation Notes

Let me verify by checking the actual code flow and understanding the problem. Based on my analysis, I now have enough information to document the issue. Let me create the research notes:

---

# Research Notes: Backend CI Test Failures

## Facts

### Project Structure
The backend is a FastAPI application with the following structure:
- **Main app**: `src/estatefox_api/main.py` (FastAPI 0.109.0+)
- **Routes**: `src/estatefox_api/routes/` containing `health.py` and `items.py`
- **Schemas**: `src/estatefox_api/schemas/` with `base.py`, `items.py`
- **Config**: `src/estatefox_api/config.py` (environment-based settings)
- **Tests**: `tests/` with `conftest.py`, `test_health.py`, `test_items.py`

### Test Structure
**File**: `backend/tests/conftest.py` (lines 1-12)
- Provides a `TestClient` fixture for FastAPI testing
- Creates test client from the FastAPI app directly
- Used by all test classes

**File**: `backend/tests/test_health.py` (lines 1-21)
- Two tests: `test_health_check` and `test_health_check_returns_service_name`
- Expects JSON response with keys: `status`, `service`, `environment`
- Expects `service` == "estatefox-api"

**File**: `backend/tests/test_items.py` (lines 1-180)
- Five test classes: `TestCreateItem`, `TestListItems`, `TestGetItem`, `TestUpdateItem`, `TestDeleteItem`
- Tests expect camelCase JSON keys: `createdAt`, `updatedAt` (lines 35-36, 137, 148)
- Tests expect `items` and `total` keys in list response
- Tests validate status codes: 201 (create), 200 (get/list/update), 204 (delete), 404 (not found), 422 (validation)

### Schema Configuration
**File**: `src/estatefox_api/schemas/base.py` (lines 1-30)
- All schemas inherit from `BaseApiModel` which configures:
  - `alias_generator=to_camel` (converts snake_case → camelCase for JSON)
  - `populate_by_name=True` (accepts both snake_case and camelCase in requests)
  - `from_attributes=True` (ORM model compatibility)
- Uses `pyhumps` library (version 3.8.0+) for case conversion

**File**: `src/estatefox_api/schemas/items.py` (lines 1-56)
- `ItemCreate`: `name` (required, 1-100 chars), `description` (optional)
- `ItemUpdate`: Both fields optional (for partial updates)
- `ItemResponse`: Includes server-generated fields `id`, `created_at`, `updated_at` (all snake_case in Python)
- `ItemListResponse`: Returns `items` list and `total` count

### Routes Implementation
**File**: `src/estatefox_api/routes/health.py` (lines 1-17)
- Single GET `/health` endpoint
- Returns dict with `status`, `service`, `environment` keys
- Gets `service_name` and `environment` from settings

**File**: `src/estatefox_api/routes/items.py` (lines 1-151)
- **Create (POST /items)**: Lines 32-57
  - Stores item as dict with snake_case keys: `id`, `name`, `description`, `created_at`, `updated_at`
  - Returns `ItemResponse(**item_data)` - Pydantic converts to response with automatic camelCase
  
- **List (GET /items)**: Lines 60-68
  - Returns `ItemListResponse(items=items, total=len(items))`
  
- **Get (GET /items/{item_id})**: Lines 71-90
  - Returns `ItemResponse(**item_data)`
  
- **Update (PATCH /items/{item_id})**: Lines 93-122
  - **CRITICAL**: Line 117 calls `item.model_dump(exclude_unset=True)` 
  - Lines 118-119: Updates internal dict directly with returned field names
  - Line 120: Sets `item_data["updated_at"] = _now()`
  - Line 122: Returns `ItemResponse(**item_data)`
  
- **Delete (DELETE /items/{item_id})**: Lines 125-144
  - Returns 204 No Content with no body
  
- **Helper (line 148-150)**: `_reset_store()` clears in-memory store for test isolation

### Key Technical Details
1. **Pydantic Version**: 2.0.0+ (uses Pydantic v2 API)
2. **CamelCase Conversion**: Uses `pyhumps.camelize()` to convert field names
3. **In-Memory Storage**: Items stored in module-level dict `_items: dict[UUID, dict]`
4. **Timestamp Source**: Uses `datetime.now(timezone.utc)` for UTC timestamps
5. **Test Isolation**: `reset_items_store()` fixture (test_items.py:15-18) resets store before each test

### CI Configuration
**File**: `backend/.github/workflows/ci.yml` (lines 1-47)
- Runs on Python 3.11
- Uses `uv` package manager
- Steps: linting (ruff), formatting check, type checking (mypy), tests (pytest with coverage)
- Test command: `uv run pytest tests/ -v --cov=src/estatefox_api --cov-report=xml`

## File Map

| File | Purpose | Key Functions |
|------|---------|---------------|
| `src/estatefox_api/main.py` | FastAPI app initialization | `app`, `lifespan()` |
| `src/estatefox_api/config.py` | Settings from env vars | `Settings` class |
| `src/estatefox_api/routes/health.py` | Health endpoint | `health_check()` |
| `src/estatefox_api/routes/items.py` | CRUD endpoints for items | `create_item()`, `list_items()`, `get_item()`, `update_item()`, `delete_item()`, `_reset_store()` |
| `src/estatefox_api/schemas/base.py` | Pydantic base config | `BaseApiModel` class, `to_camel()` |
| `src/estatefox_api/schemas/items.py` | Item schemas | `ItemCreate`, `ItemUpdate`, `ItemResponse`, `ItemListResponse` |
| `tests/conftest.py` | Test fixtures | `client` fixture (TestClient) |
| `tests/test_health.py` | Health endpoint tests | `test_health_check()`, `test_health_check_returns_service_name()` |
| `tests/test_items.py` | CRUD endpoint tests | 16 test methods across 5 test classes |

## Invariants

1. **All API responses must use Pydantic models**: Routes return `ItemResponse(**dict)`, never raw dicts (enforced by `response_model`)
2. **JSON responses must use camelCase**: Automatic conversion via `alias_generator=to_camel` in `BaseApiModel`
3. **Request input accepts both snake_case and camelCase**: `populate_by_name=True` allows flexibility
4. **Snake_case in Python code, camelCase in JSON**: Fields defined as `created_at`, serialized as `createdAt`
5. **Item data must maintain created_at unchanged**: Update operations preserve `created_at` (test line 148 validates this)
6. **In-memory store uses UUID keys**: All item lookups and storage use UUID objects
7. **Timestamps must be UTC datetime objects**: Created and updated timestamps stored as `datetime.now(timezone.utc)`
8. **Test isolation via store reset**: `_reset_store()` called before each test via `reset_items_store` fixture

## Patterns

### Response Model Pattern
- All route handlers declare `response_model=ItemResponse` (or similar)
- All route handlers return Pydantic model instances, never raw dicts
- Pydantic automatically serializes to JSON with camelCase field names via `alias_generator`

### Error Handling Pattern
- Use `HTTPException` with explicit `status_code` from `status` module
- 404 errors raised when item not found with detail message
- 422 validation errors automatically handled by Pydantic

### Testing Pattern
- All tests receive `client: TestClient` from conftest fixture
- Response JSON accessed via `response.json()` which returns Python dicts
- Test assertions check both status codes and JSON response content
- JSON keys in assertions use camelCase: `data["createdAt"]`, `data["updatedAt"]`

### Field Update Pattern
- `ItemUpdate` schema has all fields optional for partial updates
- `model_dump(exclude_unset=True)` used to get only provided fields
- Loop applies updates directly to stored dict: `item_data[field] = value`
- Always update `updated_at` timestamp after applying updates

## Risks

### Critical Issue: Field Name Mismatch in Update Route
**Location**: `src/estatefox_api/routes/items.py:117-119`

When `ItemUpdate.model_dump(exclude_unset=True)` is called:
- It returns field names in their Python form (snake_case): `name`, `description`
- These snake_case names are applied directly to the `item_data` dict
- The dict stores everything with snake_case keys
- When `ItemResponse(**item_data)` is instantiated later, Pydantic expects to receive either:
  - Aliased (camelCase) field names, OR
  - Python field names (snake_case) with `populate_by_name=True`

Since `item_data` dict uses snake_case keys and the schema has `populate_by_name=True`, this should work. However:

**Potential Issues**:
1. The description says "always use populate_by_name=True" but doesn't explicitly show `by_alias=False` behavior
2. There's a conceptual mismatch: the route handler works with raw dicts (against the DON'T in CLAUDE.md line 84)
3. The test at line 137-148 specifically validates that `createdAt` value is preserved across updates

### Dependency Risk
- `pyhumps` library used for case conversion - if behavior changes between versions, field naming could break
- Current constraint: `pyhumps>=3.8.0` allows minor version changes that could alter behavior

### Missing Test Coverage
- No explicit tests for edge cases like updating with empty strings or null values
- No tests for malformed JSON input beyond 422 validation tests
- No tests for concurrent access to the in-memory store

### Schema Validation Risk
- `ItemCreate.name` has constraints: `min_length=1, max_length=100`
- Tests verify rejection of empty name (test_items.py:48-49) but storage doesn't validate before insertion
- Direct dict modification at lines 118-119 bypasses Pydantic validation

---

This completes the research documentation. The issue is likely in how the update route handles field names when applying partial updates to the stored dict.

## Implementation Plan

Found an issue! The CI uses `--cov=src/estatefox_api --cov-report=xml` but `pytest-cov` is not in the dependencies. This will cause the tests to fail. Now I have a complete picture.

---

# Implementation Plan: Fix Backend CI Tests

## Summary

The backend CI tests are failing due to **two categories of issues**:

**Category 1: Ruff Linting Errors (4 errors)**
1. **E501** (Line too long): `__init__.py` line 1 - docstring is 103 characters (max 100)
2. **UP035** (Deprecated import): `main.py` line 4 - `AsyncGenerator` should be imported from `collections.abc` instead of `typing`
3. **E501** (Line too long): `main.py` line 24 - description string is 116 characters (max 100)
4. **UP017** (Deprecated alias): `items.py` line 29 - should use `datetime.UTC` instead of `timezone.utc`

**Category 2: Missing Test Dependency**
5. The CI workflow uses `pytest --cov` for coverage reporting, but `pytest-cov` is not listed in the dev dependencies. This will cause the test step to fail with an unrecognized option error.

All fixes are straightforward. The project uses Python 3.11+ so all modern stdlib imports are safe.

---

## Task 1: Fix Line Length in `__init__.py`

- **Description**: Shorten the docstring to fit within the 100-character line limit.

- **File(s)**: `backend/src/estatefox_api/__init__.py`

- **Code**:
  ```python
  # Before (line 1, 103 chars):
  """A full-stack real estate application for South Florida property listings, search, and management."""

  # After (shortened to fit 100 chars):
  """Real estate application for South Florida property listings, search, and management."""
  ```

- **Verification**: Run `uv run ruff check src/estatefox_api/__init__.py`

---

## Task 2: Fix Deprecated Import in `main.py`

- **Description**: Import `AsyncGenerator` from `collections.abc` instead of `typing` (UP035 fix).

- **File(s)**: `backend/src/estatefox_api/main.py`

- **Code**:
  ```python
  # Before (line 4):
  from typing import AsyncGenerator

  # After:
  from collections.abc import AsyncGenerator
  ```

- **Verification**: Run `uv run ruff check src/estatefox_api/main.py`

---

## Task 3: Fix Line Length in `main.py`

- **Description**: Shorten the FastAPI description string to fit within the 100-character line limit.

- **File(s)**: `backend/src/estatefox_api/main.py`

- **Code**:
  ```python
  # Before (lines 22-27):
  app = FastAPI(
      title="Estatefox API",
      description="A full-stack real estate application for South Florida property listings, search, and management.",
      version="0.1.0",
      lifespan=lifespan,
  )

  # After (shortened description):
  app = FastAPI(
      title="Estatefox API",
      description="Real estate application for South Florida property listings and management.",
      version="0.1.0",
      lifespan=lifespan,
  )
  ```

- **Verification**: Run `uv run ruff check src/estatefox_api/main.py`

---

## Task 4: Fix Deprecated `timezone.utc` in `items.py`

- **Description**: Use `datetime.UTC` instead of `timezone.utc` (UP017 fix).

- **File(s)**: `backend/src/estatefox_api/routes/items.py`

- **Code**:
  ```python
  # Before (line 13):
  from datetime import datetime, timezone

  # After:
  from datetime import UTC, datetime

  # Before (line 29):
  def _now() -> datetime:
      """Get current UTC timestamp."""
      return datetime.now(timezone.utc)

  # After:
  def _now() -> datetime:
      """Get current UTC timestamp."""
      return datetime.now(UTC)
  ```

- **Verification**: Run `uv run ruff check src/estatefox_api/routes/items.py`

---

## Task 5: Add Missing `pytest-cov` Dependency

- **Description**: Add `pytest-cov` to dev dependencies. The CI workflow runs `pytest tests/ -v --cov=src/estatefox_api --cov-report=xml` but `pytest-cov` is not in `pyproject.toml`, which will cause pytest to fail with "unrecognized arguments: --cov".

- **File(s)**: `backend/pyproject.toml`

- **Code**:
  ```toml
  # Before (lines 17-27):
  [project.optional-dependencies]
  dev = [
      "pytest>=8.0.0",
      "pytest-asyncio>=0.23.0",
      "httpx>=0.26.0",
      "moto>=5.0.0",
      "uvicorn>=0.27.0",
      "mypy>=1.8.0",
      "ruff>=0.2.0",
      "boto3-stubs[bedrock-runtime,ses,s3]>=1.34.0",
  ]

  # After (add pytest-cov):
  [project.optional-dependencies]
  dev = [
      "pytest>=8.0.0",
      "pytest-asyncio>=0.23.0",
      "pytest-cov>=4.1.0",
      "httpx>=0.26.0",
      "moto>=5.0.0",
      "uvicorn>=0.27.0",
      "mypy>=1.8.0",
      "ruff>=0.2.0",
      "boto3-stubs[bedrock-runtime,ses,s3]>=1.34.0",
  ]
  ```

- **Verification**: Run `uv sync` to ensure the dependency resolves correctly.

---

## Task 6: Run Complete CI Verification Suite

- **Description**: Run the full CI check suite locally to ensure everything passes (linting, formatting, type checking, and tests with coverage).

- **File(s)**: All files in `backend/`

- **Code**: No additional changes required.

- **Verification**:
  ```bash
  cd backend
  uv sync
  uv run ruff check .
  uv run ruff format --check .
  uv run mypy src/
  uv run pytest tests/ -v --cov=src/estatefox_api --cov-report=xml
  ```

  Expected output for each step:
  - `ruff check`: No errors
  - `ruff format --check`: All files formatted correctly
  - `mypy src/`: No type errors (Success: no issues found)
  - `pytest tests/ -v --cov=...`: All 15 tests pass with coverage report generated

---

## Testing Strategy

1. **Linting Verification**:
   ```bash
   cd backend
   uv run ruff check .
   ```
   Expected: No errors (0 exit code)

2. **Format Verification**:
   ```bash
   uv run ruff format --check .
   ```
   Expected: All files formatted correctly (0 exit code)

3. **Type Checking**:
   ```bash
   uv run mypy src/
   ```
   Expected: No type errors ("Success: no issues found in N source files")

4. **Test Suite with Coverage**:
   ```bash
   uv run pytest tests/ -v --cov=src/estatefox_api --cov-report=xml
   ```
   Expected: All 15 tests pass:
   - `test_health.py`: 2 tests (health check, service name)
   - `test_items.py`: 13 tests (CRUD operations across 5 test classes)
   - Coverage report generated at `coverage.xml`

5. **Full CI Simulation** (single command):
   ```bash
   uv sync && uv run ruff check . && uv run ruff format --check . && uv run mypy src/ && uv run pytest tests/ -v --cov=src/estatefox_api --cov-report=xml
   ```
   This mirrors exactly what CI runs, ensuring local verification matches CI behavior.

---

## Risks

1. **Description Wording Change**:
   - **Risk**: The shortened descriptions may not convey the full intent.
   - **Mitigation**: The shortened versions still accurately describe the application. If specific wording is required, consider using multi-line strings or adjusting the ruff line-length configuration in `pyproject.toml`.

2. **Python Version Compatibility**:
   - **Risk**: `datetime.UTC` was added in Python 3.11. If the project supports earlier Python versions, this change would break compatibility.
   - **Mitigation**: ✅ Verified - `pyproject.toml` specifies `requires-python = ">=3.11"`, so this is safe.

3. **`collections.abc.AsyncGenerator` Compatibility**:
   - **Risk**: `AsyncGenerator` in `collections.abc` requires Python 3.9+.
   - **Mitigation**: ✅ Verified - Project requires Python 3.11+, so this is safe.

4. **pytest-cov Version Compatibility**:
   - **Risk**: The specified `pytest-cov>=4.1.0` version might have conflicts.
   - **Mitigation**: pytest-cov 4.1.0+ is stable and compatible with pytest 8.x. The `uv sync` step will verify dependency resolution before tests run.

5. **Test Isolation**:
   - **Risk**: Tests might interfere with each other if the in-memory store isn't reset.
   - **Mitigation**: ✅ Verified - `test_items.py` uses an `autouse=True` fixture that calls `_reset_store()` before each test, ensuring proper isolation.

## Task List

- [ ] Fix the Import Path in conftest.py
- [ ] Fix the Import Path in test_items.py
- [ ] Verify All Tests Pass
- [ ] Verify CI Pipeline Configuration Matches Local Testing
- [ ] Fix Line Length in __init__.py
- [ ] Fix Deprecated Import in main.py
- [ ] Fix Line Length in main.py
- [ ] Fix Deprecated timezone.utc in items.py
- [ ] Verify All Linting and Tests Pass
- [ ] Fix Line Length in __init__.py
- [ ] Fix Deprecated Import in main.py
- [ ] Fix Line Length in main.py
- [ ] Fix Deprecated timezone.utc in items.py
- [ ] Add Missing pytest-cov Dependency

---
_Generated by SDLC Agent - OpenSpec Pattern_
