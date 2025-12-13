# API Client & Type Generation

This guide covers the type-safe API client setup using OpenAPI type generation and React Query.

## Overview

The API client architecture:

1. **Backend** generates `openapi.json` from Pydantic schemas
2. **Frontend** generates TypeScript types from that spec
3. **React Query hooks** use generated types for type-safe data fetching

## Generating Types

### Prerequisites

The backend must have an OpenAPI spec. For standalone usage, place `openapi.json` in the project root.

### Generation Command

```bash
# From backend spec (local file)
npm run generate:api

# With custom URL (remote spec)
OPENAPI_URL=https://api.example.com/openapi.json npm run generate:api
```

### Generated Files

Types are generated to `src/api/generated/`:

```
src/api/generated/
├── index.ts       # Re-exports everything
├── types.ts       # TypeScript interfaces
└── schemas.ts     # Validation schemas
```

**Note:** Generated files are gitignored. Regenerate after pulling backend changes.

## React Query Patterns

### Query Keys Factory

Use a factory for consistent cache keys:

```typescript
// hooks/queries/useItems.ts

export const itemKeys = {
  // All item-related queries
  all: ['items'] as const,

  // List queries
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (filters?: Filters) => [...itemKeys.lists(), filters] as const,

  // Detail queries
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
};
```

**Benefits:**
- Consistent cache invalidation
- Easy to invalidate related queries
- TypeScript inference for query keys

### Query Hooks

```typescript
// Fetch a list
export function useItems(filters?: Filters) {
  return useQuery({
    queryKey: itemKeys.list(filters),
    queryFn: () => api.get<ItemListResponse>('/items', { params: filters }),
  });
}

// Fetch single item
export function useItem(id: string) {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: () => api.get<ItemResponse>(`/items/${id}`),
    enabled: !!id, // Don't run if no ID
  });
}
```

### Mutation with Cache Invalidation

```typescript
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ItemCreate) =>
      api.post<ItemResponse>('/items', data),

    onSuccess: () => {
      // Invalidate list to refetch with new item
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}
```

### Optimistic Updates

For instant UI feedback before server confirmation:

```typescript
export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ItemUpdate }) =>
      api.put<ItemResponse>(`/items/${id}`, data),

    // Optimistically update the cache
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: itemKeys.detail(id) });

      // Snapshot the previous value
      const previous = queryClient.getQueryData(itemKeys.detail(id));

      // Optimistically update to new value
      queryClient.setQueryData(itemKeys.detail(id), (old: ItemResponse) => ({
        ...old,
        ...data,
      }));

      // Return context for rollback
      return { previous };
    },

    // If mutation fails, roll back
    onError: (err, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(itemKeys.detail(id), context.previous);
      }
    },

    // Always refetch after error or success
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(id) });
    },
  });
}
```

### Delete with Removal from Cache

```typescript
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/items/${id}`),

    onSuccess: (_, id) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: itemKeys.detail(id) });
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}
```

## Usage in Components

```typescript
import { useItems, useCreateItem } from '@/hooks/queries/useItems';

function ItemList() {
  const { data, isLoading, error } = useItems();
  const createItem = useCreateItem();

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  const handleCreate = () => {
    createItem.mutate(
      { name: 'New Item' },
      {
        onSuccess: () => {
          // Navigate or show success
        },
        onError: (error) => {
          // Show error message
        },
      }
    );
  };

  return (
    <View>
      {data.items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
      <Button
        title="Add Item"
        onPress={handleCreate}
        disabled={createItem.isPending}
      />
    </View>
  );
}
```

## Error Handling

### Global Error Handler

Configure in `app/_layout.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        // Global error handling
        console.error('Mutation error:', error);
        // Show toast/alert
      },
    },
  },
});
```

### Per-Query Error Handling

```typescript
const { data, error, isError } = useItems();

if (isError) {
  return <ErrorMessage error={error} />;
}
```

### Per-Mutation Error Handling

```typescript
const createItem = useCreateItem();

createItem.mutate(data, {
  onError: (error) => {
    Alert.alert('Error', error.message);
  },
});
```

## Configuration

### QueryClient Defaults

Located in `app/_layout.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests twice
      retry: 2,
      // Data is fresh for 30 seconds
      staleTime: 30 * 1000,
      // Cache is garbage collected after 5 minutes
      gcTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### OpenAPI-TS Config

Located in `openapi-ts.config.ts`:

```typescript
export default defineConfig({
  client: '@hey-api/client-fetch',
  input: process.env.OPENAPI_URL || './openapi.json',
  output: {
    path: 'src/api/generated',
    format: 'prettier',
  },
  services: false, // We use React Query, not generated services
  types: {
    enums: 'javascript',
  },
});
```

## For Fullstack Monorepo

In a monorepo setup:

1. **Backend exports spec:**

```bash
cd backend && python scripts/export-openapi.py
```

2. **Frontend generates types:**

```bash
cd frontend && npm run generate:api
```

3. **Or use root script:**

```bash
npm run generate:api  # Runs both steps
```

The `openapi-ts.config.ts` is pre-configured to look for `./openapi.json`, which the root script copies from backend.
