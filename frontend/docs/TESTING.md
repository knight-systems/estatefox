# Testing Guide

This guide covers the testing setup and patterns used in this Expo app.

## Test Stack

- **Jest** - Test runner with `jest-expo` preset for React Native
- **React Native Testing Library** - Component testing utilities
- **MSW (Mock Service Worker)** - API mocking

## Directory Structure

```
tests/
├── mocks/
│   ├── server.ts      # MSW server setup
│   ├── handlers.ts    # Default API handlers
│   └── db.ts          # In-memory mock database
├── factories/
│   └── items.ts       # Test data factories
├── utils/
│   └── test-utils.tsx # Custom render with providers
├── components/        # Component tests
└── hooks/            # Hook tests
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-runs on changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

## Writing Tests

### Component Tests

```typescript
import { render, screen, fireEvent } from '@/tests/utils/test-utils';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with title', () => {
    render(<Button title="Click me" onPress={() => {}} />);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button title="Click me" onPress={onPress} />);

    fireEvent.press(screen.getByText('Click me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<Button title="Click me" onPress={onPress} disabled />);

    fireEvent.press(screen.getByText('Click me'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
```

### Hook Tests with MSW

```typescript
import { renderHook, waitFor } from '@/tests/utils/test-utils';
import { useItems } from '@/hooks/queries/useItems';
import { db } from '@/tests/mocks/db';
import { createMockItem } from '@/tests/factories/items';

beforeEach(() => {
  db.reset();
});

describe('useItems', () => {
  it('returns empty list when no items exist', async () => {
    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.items).toEqual([]);
  });

  it('returns seeded items', async () => {
    // Seed test data
    db.items.seed([
      createMockItem({ name: 'Item 1' }),
      createMockItem({ name: 'Item 2' }),
    ]);

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.items).toHaveLength(2);
  });
});
```

### Overriding Handlers for Error Cases

```typescript
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';

test('handles error response', async () => {
  // Override the default handler for this test only
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
```

## Mock Database

The mock database (`tests/mocks/db.ts`) provides a centralized data store for API handlers:

```typescript
import { db } from '@/tests/mocks/db';
import { createMockItem } from '@/tests/factories/items';

// Seed data before test
db.items.seed([createMockItem()]);

// Create item
db.items.create(createMockItem({ name: 'New Item' }));

// Find item
const item = db.items.find('item-id');

// Update item
db.items.update('item-id', { name: 'Updated' });

// Delete item
db.items.delete('item-id');

// Get all items
const allItems = db.items.getAll();

// Count items
const count = db.items.count();

// Reset (call in afterEach)
db.reset();
```

## Factory Pattern

Create test data with sensible defaults and easy overrides:

```typescript
import { createMockItem, createMockItems } from '@/tests/factories/items';

// Default values
const item = createMockItem();

// Override specific fields
const item = createMockItem({
  name: 'Custom Name',
  description: 'Custom description',
});

// Create multiple items
const items = createMockItems(5);

// Multiple with overrides
const items = createMockItems(3, { description: 'Common description' });
```

## Test Utilities

The custom render function (`tests/utils/test-utils.tsx`) wraps components with necessary providers:

```typescript
import { render, screen } from '@/tests/utils/test-utils';

// Automatically wrapped with QueryClientProvider
render(<MyComponent />);

// Access the test QueryClient for cache manipulation
import { getTestQueryClient } from '@/tests/utils/test-utils';

const queryClient = getTestQueryClient();
queryClient.setQueryData(['items'], mockData);
```

## Best Practices

1. **Reset state between tests** - Always call `db.reset()` in `beforeEach` or use the automatic reset in test-utils

2. **Use factories for test data** - Never hardcode test data inline; use factories for consistency

3. **Test behavior, not implementation** - Focus on what the component/hook does, not how

4. **Keep tests focused** - One assertion per test when possible

5. **Use meaningful test names** - Describe the scenario being tested

## Future Extensions

### Adding Storybook

When you need component-driven development:

1. **Install Storybook:**

```bash
npx sb@latest init --type react_native
```

2. **Configure MSW in Storybook** (`.storybook/preview.tsx`):

```typescript
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '../tests/mocks/handlers';

initialize();

export const loaders = [mswLoader];

export const parameters = {
  msw: {
    handlers,
  },
};
```

3. **Create stories with play functions:**

```typescript
// components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'UI/Button',
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    title: 'Click me',
    onPress: () => console.log('pressed'),
  },
};

export const WithInteraction: Story = {
  args: {
    title: 'Interactive',
    onPress: jest.fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Interactive'));
    expect(args.onPress).toHaveBeenCalled();
  },
};
```

### Adding E2E Tests with Detox

For end-to-end testing across the full app:

1. **Install Detox:**

```bash
npm install -D detox @types/detox
```

2. **Configure for iOS/Android simulators**

3. **Write E2E tests:**

```typescript
describe('Items Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should create a new item', async () => {
    await element(by.id('add-item-button')).tap();
    await element(by.id('item-name-input')).typeText('New Item');
    await element(by.id('save-button')).tap();
    await expect(element(by.text('New Item'))).toBeVisible();
  });
});
```
