"""Tests for items API endpoints.

These tests demonstrate patterns for testing CRUD endpoints:
- Using fixtures for setup/teardown
- Testing success and error cases
- Validating response schemas
"""

import pytest
from fastapi.testclient import TestClient

from src.estatefox_api.routes.items import _reset_store


@pytest.fixture(autouse=True)
def reset_items_store() -> None:
    """Reset the in-memory store before each test."""
    _reset_store()


class TestCreateItem:
    """Tests for POST /items endpoint."""

    def test_create_item_success(self, client: TestClient) -> None:
        """Test creating an item with valid data."""
        response = client.post(
            "/items",
            json={"name": "Test Item", "description": "A test item"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Item"
        assert data["description"] == "A test item"
        assert "id" in data
        assert "createdAt" in data  # camelCase in JSON
        assert "updatedAt" in data

    def test_create_item_minimal(self, client: TestClient) -> None:
        """Test creating an item with only required fields."""
        response = client.post("/items", json={"name": "Minimal Item"})
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Minimal Item"
        assert data["description"] is None

    def test_create_item_empty_name_fails(self, client: TestClient) -> None:
        """Test that empty name is rejected."""
        response = client.post("/items", json={"name": ""})
        assert response.status_code == 422  # Validation error

    def test_create_item_accepts_camelcase(self, client: TestClient) -> None:
        """Test that camelCase input is accepted."""
        response = client.post(
            "/items",
            json={"name": "CamelCase Test"},
        )
        assert response.status_code == 201


class TestListItems:
    """Tests for GET /items endpoint."""

    def test_list_items_empty(self, client: TestClient) -> None:
        """Test listing items when none exist."""
        response = client.get("/items")
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0

    def test_list_items_returns_created(self, client: TestClient) -> None:
        """Test that created items appear in list."""
        # Create two items
        client.post("/items", json={"name": "Item 1"})
        client.post("/items", json={"name": "Item 2"})

        response = client.get("/items")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["items"]) == 2
        names = {item["name"] for item in data["items"]}
        assert names == {"Item 1", "Item 2"}


class TestGetItem:
    """Tests for GET /items/{item_id} endpoint."""

    def test_get_item_success(self, client: TestClient) -> None:
        """Test getting an existing item."""
        # Create an item
        create_response = client.post("/items", json={"name": "Test Item"})
        item_id = create_response.json()["id"]

        # Get the item
        response = client.get(f"/items/{item_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == item_id
        assert data["name"] == "Test Item"

    def test_get_item_not_found(self, client: TestClient) -> None:
        """Test getting a non-existent item returns 404."""
        response = client.get("/items/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestUpdateItem:
    """Tests for PATCH /items/{item_id} endpoint."""

    def test_update_item_success(self, client: TestClient) -> None:
        """Test updating an item."""
        # Create an item
        create_response = client.post(
            "/items", json={"name": "Original", "description": "Original desc"}
        )
        item_id = create_response.json()["id"]

        # Update it
        response = client.patch(
            f"/items/{item_id}",
            json={"name": "Updated"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated"
        assert data["description"] == "Original desc"  # Unchanged

    def test_update_item_partial(self, client: TestClient) -> None:
        """Test that partial updates only change specified fields."""
        # Create an item
        create_response = client.post(
            "/items", json={"name": "Original", "description": "Original desc"}
        )
        item_id = create_response.json()["id"]
        original_created_at = create_response.json()["createdAt"]

        # Update only description
        response = client.patch(
            f"/items/{item_id}",
            json={"description": "New description"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Original"
        assert data["description"] == "New description"
        assert data["createdAt"] == original_created_at  # Unchanged

    def test_update_item_not_found(self, client: TestClient) -> None:
        """Test updating a non-existent item returns 404."""
        response = client.patch(
            "/items/00000000-0000-0000-0000-000000000000",
            json={"name": "Test"},
        )
        assert response.status_code == 404


class TestDeleteItem:
    """Tests for DELETE /items/{item_id} endpoint."""

    def test_delete_item_success(self, client: TestClient) -> None:
        """Test deleting an item."""
        # Create an item
        create_response = client.post("/items", json={"name": "To Delete"})
        item_id = create_response.json()["id"]

        # Delete it
        response = client.delete(f"/items/{item_id}")
        assert response.status_code == 204

        # Verify it's gone
        get_response = client.get(f"/items/{item_id}")
        assert get_response.status_code == 404

    def test_delete_item_not_found(self, client: TestClient) -> None:
        """Test deleting a non-existent item returns 404."""
        response = client.delete("/items/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404
