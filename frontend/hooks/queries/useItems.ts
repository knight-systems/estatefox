/**
 * React Query hooks for Items resource.
 *
 * This module demonstrates the recommended patterns:
 * - Query key factory for consistent cache keys
 * - useQuery for data fetching
 * - useMutation for create/update/delete
 * - Automatic cache invalidation on mutations
 *
 * Types are imported from generated API client.
 * Run `npm run generate:api` after backend changes.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { api } from '../../services/api';

// Types - replace with generated types when available
// import type { ItemCreate, ItemUpdate, ItemResponse, ItemListResponse } from '../../src/api/generated';

// Placeholder types until OpenAPI generation
export interface Item {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCreate {
  name: string;
  description?: string | null;
}

export interface ItemUpdate {
  name?: string;
  description?: string | null;
}

export interface ItemListResponse {
  items: Item[];
  total: number;
}

/**
 * Query key factory for items.
 *
 * Using a factory ensures consistent keys across all hooks
 * and makes cache invalidation predictable.
 *
 * @example
 * // All items
 * queryClient.invalidateQueries({ queryKey: itemKeys.all });
 *
 * // Specific item
 * queryClient.invalidateQueries({ queryKey: itemKeys.detail('123') });
 */
export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...itemKeys.lists(), filters] as const,
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
};

/**
 * Fetch all items.
 *
 * @example
 * const { data, isLoading, error } = useItems();
 */
export function useItems(
  options?: Omit<UseQueryOptions<ItemListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: itemKeys.lists(),
    queryFn: async () => {
      const response = await api.get<ItemListResponse>('/items');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    ...options,
  });
}

/**
 * Fetch a single item by ID.
 *
 * @example
 * const { data, isLoading } = useItem('123');
 */
export function useItem(
  id: string,
  options?: Omit<UseQueryOptions<Item>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<Item>(`/items/${id}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new item.
 *
 * Automatically invalidates the items list on success.
 *
 * @example
 * const createItem = useCreateItem();
 * createItem.mutate({ name: 'New Item', description: 'Description' });
 */
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ItemCreate) => {
      const response = await api.post<Item>('/items', data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate list to refetch with new item
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}

/**
 * Update an existing item.
 *
 * Supports partial updates - only provided fields are changed.
 * Invalidates both the specific item and the list.
 *
 * @example
 * const updateItem = useUpdateItem();
 * updateItem.mutate({ id: '123', data: { name: 'Updated Name' } });
 */
export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ItemUpdate }) => {
      const response = await api.put<Item>(`/items/${id}`, data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (data, { id }) => {
      // Update the specific item in cache
      queryClient.setQueryData(itemKeys.detail(id), data);
      // Invalidate list to ensure it's up to date
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}

/**
 * Delete an item.
 *
 * Removes from cache and invalidates the list.
 *
 * @example
 * const deleteItem = useDeleteItem();
 * deleteItem.mutate('123');
 */
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<void>(`/items/${id}`);
      if (response.error) {
        throw new Error(response.error);
      }
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: itemKeys.detail(id) });
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}
