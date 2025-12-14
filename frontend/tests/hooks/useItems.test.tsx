/**
 * Tests for useItems hook.
 *
 * Demonstrates React Query hook testing patterns:
 * - Using MSW for API mocking
 * - Using the mock database for test data
 * - Testing loading, success, and error states
 * - Testing mutations with cache invalidation
 */

import { renderHook, waitFor } from '../utils/test-utils';
import { useItems, useItem, useCreateItem, useDeleteItem } from '../../hooks/queries/useItems';
import { db } from '../mocks/db';
import { createMockItem, resetItemCounter } from '../factories/items';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Reset test state before each test
beforeEach(() => {
  resetItemCounter();
  db.reset();
});

describe('useItems', () => {
  it('returns empty list when no items exist', async () => {
    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.items).toEqual([]);
    expect(result.current.data?.total).toBe(0);
  });

  it('returns seeded items', async () => {
    // Seed test data
    const items = [
      createMockItem({ name: 'Item 1' }),
      createMockItem({ name: 'Item 2' }),
    ];
    db.items.seed(items);

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.items).toHaveLength(2);
    expect(result.current.data?.total).toBe(2);
  });

  it('handles error response', async () => {
    // Override handler to return error
    server.use(
      http.get('https://api.estatefox.example.com/items', () => {
        return HttpResponse.json(
          { detail: 'Internal server error' },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useItem', () => {
  it('returns single item by ID', async () => {
    const item = createMockItem({ name: 'Test Item' });
    db.items.create(item);

    const { result } = renderHook(() => useItem(item.id));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.name).toBe('Test Item');
  });

  it('handles not found error', async () => {
    const { result } = renderHook(() => useItem('non-existent-id'));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('is disabled when ID is empty', () => {
    const { result } = renderHook(() => useItem(''));

    // Query should not run when ID is empty
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateItem', () => {
  it('creates item and returns it', async () => {
    const { result } = renderHook(() => useCreateItem());

    result.current.mutate({ name: 'New Item', description: 'Description' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.name).toBe('New Item');
    expect(result.current.data?.description).toBe('Description');
    expect(result.current.data?.id).toBeDefined();
  });

  it('adds item to database', async () => {
    const { result } = renderHook(() => useCreateItem());

    result.current.mutate({ name: 'Database Item' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify item was added to mock database
    expect(db.items.count()).toBe(1);
    expect(db.items.getAll()[0].name).toBe('Database Item');
  });
});

describe('useDeleteItem', () => {
  it('deletes item from database', async () => {
    const item = createMockItem({ name: 'To Delete' });
    db.items.create(item);
    expect(db.items.count()).toBe(1);

    const { result } = renderHook(() => useDeleteItem());

    result.current.mutate(item.id);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify item was removed from mock database
    expect(db.items.count()).toBe(0);
  });
});

