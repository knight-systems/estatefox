# Estatefox API - Development Guide

## Quick Reference

```bash
# Development
uvicorn src.estatefox_api.main:app --reload --port 8000

# Testing
pytest tests/ -v
pytest tests/ --cov=src/estatefox_api

# Code quality
ruff check .
ruff format .
mypy

# Generate OpenAPI spec (for frontend type generation)
python scripts/export-openapi.py
```

---

## Code Patterns

### Pydantic Schemas

All API schemas **must** inherit from `BaseApiModel`:

```python
from estatefox_api.schemas.base import BaseApiModel

class ItemResponse(BaseApiModel):
    item_name: str      # Python: snake_case
    created_at: datetime  # JSON: camelCase (itemName, createdAt)
```

This provides:
- Automatic snake_case → camelCase for JSON responses
- `populate_by_name=True` - accepts both formats in requests
- `from_attributes=True` - converts ORM models

### Route Structure

```python
from fastapi import APIRouter, HTTPException, status
from ..schemas import ItemCreate, ItemResponse

router = APIRouter(prefix="/items", tags=["items"])

@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(item: ItemCreate) -> ItemResponse:
    # Always use explicit response_model
    # Return Pydantic model, not dict
    pass
```

### Testing

Tests use `pytest` with `TestClient`:

```python
def test_create_item(client: TestClient) -> None:
    response = client.post("/items", json={"name": "Test"})
    assert response.status_code == 201
    assert response.json()["name"] == "Test"
```

---

## Do's and Don'ts

### DO

- Inherit all API schemas from `BaseApiModel`
- Use `Field()` for validation: `name: str = Field(..., min_length=1, max_length=100)`
- Use explicit `response_model` on routes
- Use `HTTPException` with specific status codes
- Add type hints to all functions
- Write tests for success and error cases

### DON'T

- Return raw dicts from routes (use Pydantic models)
- Use `Any` type
- Skip validation on request schemas
- Catch generic `Exception` without re-raising
- Forget to add new routes to `main.py`

---

## Adding a New Resource

1. **Create schema** in `src/estatefox_api/schemas/{resource}.py`:
   ```python
   class UserCreate(BaseApiModel):
       email: str = Field(..., description="User email")

   class UserResponse(BaseApiModel):
       id: UUID
       email: str
       created_at: datetime
   ```

2. **Create route** in `src/estatefox_api/routes/{resource}.py`:
   ```python
   router = APIRouter(prefix="/users", tags=["users"])

   @router.post("", response_model=UserResponse)
   async def create_user(user: UserCreate) -> UserResponse:
       pass
   ```

3. **Register router** in `main.py`:
   ```python
   from .routes import users
   app.include_router(users.router)
   ```

4. **Add tests** in `tests/test_{resource}.py`

5. **Export OpenAPI** for frontend:
   ```bash
   python scripts/export-openapi.py
   ```

---

## Deep Dive

For detailed patterns including database setup (SQLAlchemy + Alembic), see:
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
