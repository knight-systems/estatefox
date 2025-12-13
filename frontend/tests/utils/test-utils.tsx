/**
 * Test utilities with providers wrapper.
 *
 * Provides custom render that wraps components with necessary providers.
 * Re-exports React Testing Library for convenient imports.
 *
 * Usage:
 *   import { render, screen, fireEvent } from '@/tests/utils/test-utils';
 *
 *   test('my test', () => {
 *     render(<MyComponent />);
 *     expect(screen.getByText('Hello')).toBeTruthy();
 *   });
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a QueryClient configured for testing.
 *
 * - retry: false - Don't retry failed queries
 * - gcTime: 0 - Immediately garbage collect
 * - staleTime: 0 - Data is immediately stale
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Create a fresh client for each test
let testQueryClient: QueryClient;

beforeEach(() => {
  testQueryClient = createTestQueryClient();
});

afterEach(() => {
  testQueryClient.clear();
});

/**
 * Wrapper component that provides all necessary context providers.
 * Add additional providers (Auth, Theme, etc.) as needed.
 */
function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Custom render that wraps component in providers.
 *
 * @param ui - Component to render
 * @param options - Render options
 * @returns Render result with all queries
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Get the test QueryClient for direct cache manipulation.
 *
 * @example
 * getTestQueryClient().setQueryData(['items'], mockData);
 */
export function getTestQueryClient(): QueryClient {
  return testQueryClient;
}

// Re-export everything from RTL
export * from '@testing-library/react-native';

// Override render with custom render
export { customRender as render };

// Export waitFor for async assertions
export { waitFor };

