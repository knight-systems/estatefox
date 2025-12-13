# Architecture Guide

This document describes the API patterns and architecture used in this service.

## API Schema Patterns

### BaseApiModel

All API schemas inherit from `BaseApiModel` which provides automatic conversion between Python snake_case and JSON camelCase:

```python
from estatefox_api.schemas.base import BaseApiModel

class UserResponse(BaseApiModel):
    user_name: str      # In Python: user_name
    created_at: datetime  # In JSON: userName, createdAt
```

**Features:**
- `alias_generator=camelize` - Converts snake_case to camelCase for JSON output
- `populate_by_name=True` - Accepts both snake_case and camelCase in requests
- `from_attributes=True` - Enables ORM model conversion

### Adding New Resources

Follow this pattern when adding new API resources:

1. **Create schemas** in `src/estatefox_api/schemas/{resource}.py`:

```python
from .base import BaseApiModel
from pydantic import Field
from uuid import UUID
from datetime import datetime

class UserCreate(BaseApiModel):
    """Request schema for creating a user."""
    email: str = Field(..., description="User email")
    name: str = Field(..., min_length=1, max_length=100)

class UserResponse(BaseApiModel):
    """Response schema for a user."""
    id: UUID
    email: str
    name: str
    created_at: datetime
    updated_at: datetime
```

2. **Create route** in `src/estatefox_api/routes/{resource}.py`:

```python
from fastapi import APIRouter, HTTPException, status
from ..schemas import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate) -> UserResponse:
    # Implementation here
    pass
```

3. **Register router** in `main.py`:

```python
from .routes import health, items, users

app.include_router(users.router)
```

4. **Export schemas** in `schemas/__init__.py`:

```python
from .users import UserCreate, UserResponse
```

## OpenAPI Type Generation

This service generates an OpenAPI specification that can be consumed by frontend tools to generate TypeScript types.

### Generating the Spec

```bash
python scripts/export-openapi.py
```

This creates `openapi.json` in the project root.

### For Fullstack Monorepo

The frontend can then generate types:

```bash
# From monorepo root
npm run generate:api

# This runs:
# 1. python scripts/export-openapi.py (backend)
# 2. npm run generate:api (frontend)
```

## Project Structure

```
src/estatefox_api/
├── main.py              # FastAPI app entrypoint
├── config.py            # Configuration settings
├── schemas/             # Pydantic schemas
│   ├── __init__.py      # Schema exports
│   ├── base.py          # BaseApiModel
│   └── items.py         # Example resource schemas
├── routes/              # API routes
│   ├── __init__.py
│   ├── health.py        # Health check endpoint
│   └── items.py         # Example CRUD routes
├── models/              # Database models (when added)
└── services/            # Business logic services
```

## Future Extensions

### Adding a Database (SQLAlchemy + Alembic)

When you need persistence beyond the in-memory store:

1. **Add dependencies:**

```bash
pip install sqlalchemy[asyncio] alembic asyncpg
```

Or add to `pyproject.toml`:

```toml
dependencies = [
    ...
    "sqlalchemy[asyncio]>=2.0.0",
    "alembic>=1.12.0",
    "asyncpg>=0.29.0",
]
```

2. **Create database modules:**

```
src/estatefox_api/
└── db/
    ├── __init__.py
    ├── engine.py      # AsyncEngine setup
    ├── models.py      # SQLAlchemy models
    └── session.py     # AsyncSession dependency
```

3. **db/engine.py:**

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from ..config import settings

engine: AsyncEngine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
)
```

4. **db/models.py with mixins:**

```python
from datetime import datetime
from uuid import uuid4, UUID
from sqlalchemy import func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class Identifiable:
    """Mixin for UUID primary key."""
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

class Timestamps:
    """Mixin for created_at and updated_at timestamps."""
    created_at: Mapped[datetime] = mapped_column(
        default=func.now(),
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=func.now(),
        onupdate=func.now(),
        server_default=func.now()
    )

class Item(Base, Identifiable, Timestamps):
    __tablename__ = "items"

    name: Mapped[str] = mapped_column(index=True)
    description: Mapped[str | None]
```

5. **db/session.py:**

```python
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from .engine import engine

async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
```

6. **Initialize Alembic:**

```bash
alembic init migrations
```

7. **Create migration:**

```bash
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### Adding Service Layer

For complex business logic, introduce a service layer:

```python
# services/item_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.models import Item
from ..schemas import ItemCreate, ItemResponse

class ItemService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: ItemCreate) -> Item:
        item = Item(**data.model_dump())
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item

# Usage in route
@router.post("", response_model=ItemResponse)
async def create_item(
    data: ItemCreate,
    db: AsyncSession = Depends(get_db)
) -> ItemResponse:
    service = ItemService(db)
    item = await service.create(data)
    return ItemResponse.model_validate(item)
```

## Testing Patterns

### Unit Tests

Tests use `pytest` with `TestClient` for HTTP assertions:

```python
def test_create_item(client: TestClient) -> None:
    response = client.post("/items", json={"name": "Test"})
    assert response.status_code == 201
    assert response.json()["name"] == "Test"
```

### Testing with Database

When using SQLAlchemy, use fixtures with transaction rollback:

```python
@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        async with session.begin():
            yield session
            await session.rollback()
```
