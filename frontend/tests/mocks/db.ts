/**
 * Mock database for MSW handlers.
 *
 * Provides a centralized, type-safe data store for API mocking.
 * Each entity type has CRUD operations + seed/reset for testing.
 *
 * Usage in tests:
 *   import { db } from '@/tests/mocks/db';
 *
 *   beforeEach(() => {
 *     db.items.seed([createMockItem({ name: 'Test' })]);
 *   });
 *
 *   afterEach(() => {
 *     db.reset();
 *   });
 */

import type { Item } from '../../hooks/queries/useItems';

/**
 * Mock database class with entity stores.
 *
 * Add new entity stores following the items pattern:
 * 1. Add private Map: `private _users: Map<string, User> = new Map();`
 * 2. Add getter with CRUD operations
 */
class MockDatabase {
  private _items: Map<string, Item> = new Map();

  /**
   * Items entity store.
   */
  get items() {
    return {
      getAll: () => Array.from(this._items.values()),
      find: (id: string) => this._items.get(id),
      create: (item: Item) => {
        this._items.set(item.id, item);
        return item;
      },
      update: (id: string, updates: Partial<Item>) => {
        const existing = this._items.get(id);
        if (!existing) return null;
        const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
        this._items.set(id, updated);
        return updated;
      },
      delete: (id: string) => {
        return this._items.delete(id);
      },
      seed: (items: Item[]) => {
        items.forEach((item) => this._items.set(item.id, item));
      },
      reset: () => {
        this._items.clear();
      },
      count: () => this._items.size,
    };
  }

  /**
   * Reset all entity stores.
   * Call in afterEach to ensure test isolation.
   */
  reset() {
    this._items.clear();
    // Add additional store resets here
  }
}

export const db = new MockDatabase();
