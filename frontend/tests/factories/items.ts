/**
 * Test data factory for Items.
 *
 * Creates mock data with sensible defaults and easy overrides.
 * Uses deep partial pattern for flexible customization.
 *
 * Usage:
 *   const item = createMockItem(); // Default values
 *   const item = createMockItem({ name: 'Custom' }); // Override name
 *   const items = createMockItems(5); // Create 5 items
 */

import type { Item } from '../../hooks/queries/useItems';

let itemCounter = 0;

/**
 * Create a mock item with defaults.
 *
 * @param overrides - Partial item to override defaults
 * @returns Complete Item object
 *
 * @example
 * const item = createMockItem({ name: 'Test Item' });
 */
export function createMockItem(overrides: Partial<Item> = {}): Item {
  itemCounter++;
  const now = new Date().toISOString();

  return {
    id: overrides.id ?? crypto.randomUUID(),
    name: overrides.name ?? `Item ${itemCounter}`,
    description: overrides.description ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

/**
 * Create multiple mock items.
 *
 * @param count - Number of items to create
 * @param overrides - Partial item to apply to all items
 * @returns Array of Item objects
 *
 * @example
 * const items = createMockItems(3, { description: 'Common description' });
 */
export function createMockItems(
  count: number,
  overrides: Partial<Item> = {}
): Item[] {
  return Array.from({ length: count }, () => createMockItem(overrides));
}

/**
 * Reset the item counter.
 * Call in beforeEach if you need predictable item names.
 */
export function resetItemCounter(): void {
  itemCounter = 0;
}
