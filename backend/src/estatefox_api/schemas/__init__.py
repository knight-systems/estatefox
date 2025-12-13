"""API schemas module.

All schemas inherit from BaseApiModel which provides:
- Automatic snake_case → camelCase conversion for JSON
- ORM model compatibility (from_attributes=True)
- Flexible input (populate_by_name=True)
"""

from .base import BaseApiModel
from .items import ItemCreate, ItemListResponse, ItemResponse, ItemUpdate

__all__ = [
    "BaseApiModel",
    "ItemCreate",
    "ItemUpdate",
    "ItemResponse",
    "ItemListResponse",
]
