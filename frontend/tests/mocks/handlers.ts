/**
 * MSW request handlers for API mocking.
 *
 * These handlers intercept HTTP requests and return mock responses
 * using data from the mock database.
 *
 * Override handlers in specific tests using server.use():
 *   server.use(
 *     http.get('/items', () => HttpResponse.json({ error: 'Failed' }, { status: 500 }))
 *   );
 */

import { http, HttpResponse } from 'msw';
import { db } from './db';
import type { Item, ItemCreate, ItemUpdate } from '../../hooks/queries/useItems';

const API_BASE = 'https://api.estatefox.example.com';

export const handlers = [
  // List items
  http.get(`${API_BASE}/items`, () => {
    const items = db.items.getAll();
    return HttpResponse.json({
      items,
      total: items.length,
    });
  }),

  // Get single item
  http.get(`${API_BASE}/items/:id`, ({ params }) => {
    const item = db.items.find(params.id as string);
    if (!item) {
      return HttpResponse.json(
        { detail: `Item ${params.id} not found` },
        { status: 404 }
      );
    }
    return HttpResponse.json(item);
  }),

  // Create item
  http.post(`${API_BASE}/items`, async ({ request }) => {
    const body = (await request.json()) as ItemCreate;
    const now = new Date().toISOString();
    const newItem: Item = {
      id: crypto.randomUUID(),
      name: body.name,
      description: body.description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    db.items.create(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  // Update item
  http.patch(`${API_BASE}/items/:id`, async ({ params, request }) => {
    const body = (await request.json()) as ItemUpdate;
    const updated = db.items.update(params.id as string, body);
    if (!updated) {
      return HttpResponse.json(
        { detail: `Item ${params.id} not found` },
        { status: 404 }
      );
    }
    return HttpResponse.json(updated);
  }),

  // Delete item
  http.delete(`${API_BASE}/items/:id`, ({ params }) => {
    const deleted = db.items.delete(params.id as string);
    if (!deleted) {
      return HttpResponse.json(
        { detail: `Item ${params.id} not found` },
        { status: 404 }
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Health check
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({
      status: 'healthy',
      service: 'estatefox',
      environment: 'test',
    });
  }),
];
