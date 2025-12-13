# Estatefox - Development Guide

## Quick Reference

```bash
# Development
npm start           # Start Expo dev server
npm run ios         # iOS simulator
npm run android     # Android emulator
npm run web         # Web browser

# Testing
npm test            # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage

# Type generation (from backend OpenAPI spec)
npm run generate:api

# Type checking
npm run tsc
```

---

## Code Patterns

### Components

Use named exports, StyleSheet, and testID:

```typescript
// components/ui/Button.tsx
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export function Button({ title, onPress, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      testID="button"
      style={styles.button}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 12, borderRadius: 8 },
  text: { fontSize: 16 },
});
```

### React Query Hooks

Always use query key factories:

```typescript
// hooks/queries/useItems.ts
export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  detail: (id: string) => [...itemKeys.all, 'detail', id] as const,
};

export function useItems() {
  return useQuery({
    queryKey: itemKeys.lists(),
    queryFn: () => api.get('/items'),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}
```

### Testing with MSW

Use mock database and factories:

```typescript
// tests/hooks/useItems.test.tsx
import { db } from '../mocks/db';
import { createMockItem } from '../factories/items';

beforeEach(() => {
  db.reset();
  db.items.seed([createMockItem({ name: 'Test Item' })]);
});

test('useItems returns seeded data', async () => {
  const { result } = renderHook(() => useItems(), { wrapper: AllProviders });
  await waitFor(() => expect(result.current.data?.items).toHaveLength(1));
});
```

---

## Do's and Don'ts

### DO

- Use named exports (not default exports)
- Use `testID` prop for test selectors
- Use query key factories for all queries
- Use factories for test data (`createMockItem()`)
- Use `tests/utils/test-utils.tsx` for rendering
- Reset mock state in `beforeEach`
- Invalidate queries after mutations

### DON'T

- Use default exports
- Inline API calls in components (use hooks)
- Hardcode test data (use factories)
- Use `any` type
- Skip error/loading state handling
- Forget to invalidate cache after mutations

---

## Testing Checklist

When adding new features:

- [ ] Component renders correctly
- [ ] User interactions work (onPress, etc.)
- [ ] Loading state displays
- [ ] Error state handles API failures
- [ ] Hook fetches data via MSW
- [ ] Mutations update cache

### Override MSW for error testing:

```typescript
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

test('handles error', async () => {
  server.use(
    http.get('https://api.estatefox.example.com/items', () =>
      HttpResponse.json({ error: 'Failed' }, { status: 500 })
    )
  );
  // Test error handling...
});
```

---

## Type Generation

When backend schemas change:

```bash
# Get OpenAPI spec from running backend
OPENAPI_URL=http://localhost:8000/openapi.json npm run generate:api

# Or from local file (monorepo)
npm run generate:api
```

Generated types go to `src/api/generated/`. This directory is gitignored - regenerate after pulling backend changes.

---

## Deep Dive

- [docs/TESTING.md](docs/TESTING.md) - Testing patterns, MSW, factories
- [docs/API-CLIENT.md](docs/API-CLIENT.md) - React Query patterns, type generation
