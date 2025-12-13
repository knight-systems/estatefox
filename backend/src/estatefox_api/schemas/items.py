"""Item schemas - Example resource demonstrating API patterns.

This module provides example schemas for a simple Item resource.
Use this as a reference when creating schemas for your own resources.
"""

from datetime import datetime
from uuid import UUID

from pydantic import Field

from .base import BaseApiModel


class ItemCreate(BaseApiModel):
    """Request schema for creating an item.

    Validates input and documents the API contract.
    """

    name: str = Field(..., min_length=1, max_length=100, description="Item name")
    description: str | None = Field(
        None, max_length=500, description="Optional item description"
    )


class ItemUpdate(BaseApiModel):
    """Request schema for updating an item.

    All fields are optional for partial updates.
    """

    name: str | None = Field(None, min_length=1, max_length=100, description="Item name")
    description: str | None = Field(None, max_length=500, description="Item description")


class ItemResponse(BaseApiModel):
    """Response schema for an item.

    Includes server-generated fields like id and timestamps.
    Note: field names are snake_case in Python but camelCase in JSON.
    """

    id: UUID = Field(..., description="Unique item identifier")
    name: str = Field(..., description="Item name")
    description: str | None = Field(None, description="Item description")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class ItemListResponse(BaseApiModel):
    """Response schema for listing items with pagination metadata."""

    items: list[ItemResponse] = Field(..., description="List of items")
    total: int = Field(..., ge=0, description="Total number of items")
