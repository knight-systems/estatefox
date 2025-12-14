"""Items API routes - Example CRUD resource.

This module demonstrates the recommended patterns for API routes:
- Type-safe request/response with Pydantic schemas
- In-memory store (replace with database in production)
- Proper error handling with HTTPException
- OpenAPI documentation via docstrings

Replace the in-memory store with your database of choice.
See docs/ARCHITECTURE.md for database integration guidance.
"""

from datetime import datetime, timezone
from typing import Any, TypedDict, cast
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, status

from ..schemas import ItemCreate, ItemListResponse, ItemResponse, ItemUpdate


class ItemDict(TypedDict):
    """Type definition for item storage."""

    id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime

router = APIRouter(prefix="/items", tags=["items"])

# In-memory store - replace with database in production
# This is a placeholder to demonstrate the API patterns
_items: dict[UUID, ItemDict] = {}


def _now() -> datetime:
    """Get current UTC timestamp."""
    return datetime.now(timezone.utc)


@router.post(
    "",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an item",
)
async def create_item(item: ItemCreate) -> ItemResponse:
    """Create a new item.

    Args:
        item: Item creation data (name, optional description)

    Returns:
        The created item with generated id and timestamps
    """
    item_id = uuid4()
    now = _now()
    item_data: ItemDict = {
        "id": item_id,
        "name": item.name,
        "description": item.description,
        "created_at": now,
        "updated_at": now,
    }
    _items[item_id] = item_data
    return ItemResponse(**item_data)


@router.get("", response_model=ItemListResponse, summary="List all items")
async def list_items() -> ItemListResponse:
    """List all items.

    Returns:
        List of items with total count
    """
    items = [ItemResponse(**item_data) for item_data in _items.values()]
    return ItemListResponse(items=items, total=len(items))


@router.get("/{item_id}", response_model=ItemResponse, summary="Get an item")
async def get_item(item_id: UUID) -> ItemResponse:
    """Get an item by ID.

    Args:
        item_id: The item's unique identifier

    Returns:
        The requested item

    Raises:
        HTTPException: 404 if item not found
    """
    item_data = _items.get(item_id)
    if item_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item {item_id} not found",
        )
    return ItemResponse(**item_data)


@router.patch("/{item_id}", response_model=ItemResponse, summary="Update an item")
async def update_item(item_id: UUID, item: ItemUpdate) -> ItemResponse:
    """Update an item by ID.

    Supports partial updates - only provided fields are updated.

    Args:
        item_id: The item's unique identifier
        item: Fields to update

    Returns:
        The updated item

    Raises:
        HTTPException: 404 if item not found
    """
    item_data = _items.get(item_id)
    if item_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item {item_id} not found",
        )

    # Apply partial updates - cast to dict for dynamic updates
    item_dict = cast(dict[str, Any], item_data)
    update_data = item.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        item_dict[field] = value
    item_dict["updated_at"] = _now()

    return ItemResponse(**item_data)


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an item",
)
async def delete_item(item_id: UUID) -> None:
    """Delete an item by ID.

    Args:
        item_id: The item's unique identifier

    Raises:
        HTTPException: 404 if item not found
    """
    if item_id not in _items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item {item_id} not found",
        )
    del _items[item_id]


# For testing - allows clearing state between tests
def _reset_store() -> None:
    """Reset the in-memory store. Used in tests."""
    _items.clear()
