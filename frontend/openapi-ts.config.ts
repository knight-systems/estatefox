import { defineConfig } from '@hey-api/openapi-ts';

/**
 * OpenAPI TypeScript Client Configuration
 *
 * Generates type-safe API client from OpenAPI spec.
 *
 * Usage:
 *   npm run generate:api
 *
 * Input sources (in order of precedence):
 *   1. OPENAPI_URL env var - for remote specs
 *   2. ./openapi.json - for local specs (monorepo)
 *
 * For fullstack monorepo, the backend exports openapi.json:
 *   cd ../backend && python scripts/export-openapi.py
 *   npm run generate:api
 */
export default defineConfig({
  client: '@hey-api/client-fetch',
  input: process.env.OPENAPI_URL || './openapi.json',
  output: {
    path: 'src/api/generated',
    format: 'prettier',
  },
  // Generate types only, we use React Query for data fetching
  services: false,
  types: {
    enums: 'javascript',
  },
});
