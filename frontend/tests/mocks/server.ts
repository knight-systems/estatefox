/**
 * MSW server setup for Node.js test environment.
 *
 * This server intercepts HTTP requests during Jest tests.
 * Handlers are defined in ./handlers.ts.
 *
 * Usage:
 *   - jest.setup.ts starts/stops the server
 *   - Override handlers in tests with server.use()
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
