"""Base schema configuration with camelCase JSON conversion."""

from humps import camelize
from pydantic import BaseModel, ConfigDict


def to_camel(string: str) -> str:
    """Convert snake_case to camelCase."""
    return camelize(string)


class BaseApiModel(BaseModel):
    """Base model for all API schemas.

    Features:
    - Automatic snake_case → camelCase conversion for JSON responses
    - Accepts both snake_case and camelCase in requests (populate_by_name=True)
    - ORM model conversion support (from_attributes=True)

    Usage:
        class UserResponse(BaseApiModel):
            user_name: str      # In Python: user_name
            created_at: datetime  # In JSON: userName, createdAt
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
