/**
 * Jest setup file - runs before each test file.
 *
 * Configures:
 * - React Native Testing Library matchers
 * - MSW server for API mocking
 */

import '@testing-library/react-native/extend-expect';
import { server } from './tests/mocks/server';

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers between tests (removes runtime handlers)
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

// Silence React Query dev mode warnings in tests
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.spyOn(console, 'error').mockImplementation(() => {});
