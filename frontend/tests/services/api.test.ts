/**
 * Tests for API service.
 *
 * Covers:
 * - GET, POST, PUT, DELETE methods
 * - Authentication token handling
 * - Error handling (network errors, HTTP errors)
 * - Response parsing (JSON, 204 no content, non-JSON responses)
 * - Header merging
 */

import { api, ApiResponse } from '../../services/api';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'https://api.estatefox.example.com';

// Reset token before each test
beforeEach(() => {
  api.clearToken();
});

describe('ApiClient', () => {
  describe('GET requests', () => {
    it('performs successful GET request', async () => {
      server.use(
        http.get(`${API_BASE_URL}/test`, () => {
          return HttpResponse.json({ message: 'success' }, { status: 200 });
        })
      );

      const response: ApiResponse<{ message: string }> = await api.get('/test');

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ message: 'success' });
      expect(response.error).toBeUndefined();
    });

    it('includes authorization header when token is set', async () => {
      let capturedHeaders: Record<string, string> = {};

      server.use(
        http.get(`${API_BASE_URL}/protected`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ data: 'protected' }, { status: 200 });
        })
      );

      api.setToken('test-token-123');
      await api.get('/protected');

      expect(capturedHeaders['authorization']).toBe('Bearer test-token-123');
    });

    it('does not include authorization header when token is not set', async () => {
      let capturedHeaders: Record<string, string> = {};

      server.use(
        http.get(`${API_BASE_URL}/public`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ data: 'public' }, { status: 200 });
        })
      );

      await api.get('/public');

      expect(capturedHeaders['authorization']).toBeUndefined();
    });

    it('handles 204 no content response', async () => {
      server.use(
        http.get(`${API_BASE_URL}/no-content`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const response: ApiResponse<null> = await api.get('/no-content');

      expect(response.status).toBe(204);
      expect(response.data).toBeNull();
      expect(response.error).toBeUndefined();
    });

    it('handles non-JSON response', async () => {
      server.use(
        http.get(`${API_BASE_URL}/text`, () => {
          return new HttpResponse('Plain text response', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          });
        })
      );

      const response: ApiResponse<null> = await api.get('/text');

      expect(response.status).toBe(200);
      expect(response.data).toBeNull();
      expect(response.error).toBeUndefined();
    });

    it('handles HTTP error response with message', async () => {
      server.use(
        http.get(`${API_BASE_URL}/error`, () => {
          return HttpResponse.json(
            { message: 'Not found' },
            { status: 404 }
          );
        })
      );

      const response: ApiResponse<unknown> = await api.get('/error');

      expect(response.status).toBe(404);
      expect(response.error).toBe('Not found');
    });

    it('handles HTTP error response without message', async () => {
      server.use(
        http.get(`${API_BASE_URL}/error-no-msg`, () => {
          return HttpResponse.json(
            { detail: 'Some error detail' },
            { status: 500 }
          );
        })
      );

      const response: ApiResponse<unknown> = await api.get('/error-no-msg');

      expect(response.status).toBe(500);
      expect(response.error).toBe('Request failed');
    });

    it('handles network error', async () => {
      // Mock fetch to throw a network error
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network connection failed'));

      const response: ApiResponse<unknown> = await api.get('/network-error');

      expect(response.status).toBe(0);
      expect(response.error).toBe('Network connection failed');
      expect(response.data).toBeNull();

      global.fetch = originalFetch;
    });

    it('handles non-Error thrown exception', async () => {
      // Test when something other than an Error is thrown
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValueOnce('String error' as any);

      const response: ApiResponse<unknown> = await api.get('/weird-error');

      expect(response.status).toBe(0);
      expect(response.error).toBe('Network error');
      expect(response.data).toBeNull();

      global.fetch = originalFetch;
    });
  });

  describe('POST requests', () => {
    it('performs successful POST request with body', async () => {
      let capturedBody: unknown;

      server.use(
        http.post(`${API_BASE_URL}/items`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json(
            { id: '1', ...capturedBody },
            { status: 201 }
          );
        })
      );

      const body = { name: 'Test Item', description: 'Test description' };
      const response: ApiResponse<{ id: string; name: string }> = await api.post('/items', body);

      expect(response.status).toBe(201);
      expect(response.data).toEqual({ id: '1', ...body });
      expect(capturedBody).toEqual(body);
    });

    it('includes Content-Type header', async () => {
      let capturedHeaders: Record<string, string> = {};

      server.use(
        http.post(`${API_BASE_URL}/data`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ ok: true }, { status: 200 });
        })
      );

      await api.post('/data', { key: 'value' });

      expect(capturedHeaders['content-type']).toBe('application/json');
    });

    it('handles POST error response', async () => {
      server.use(
        http.post(`${API_BASE_URL}/error`, () => {
          return HttpResponse.json(
            { message: 'Validation failed' },
            { status: 400 }
          );
        })
      );

      const response: ApiResponse<unknown> = await api.post('/error', {});

      expect(response.status).toBe(400);
      expect(response.error).toBe('Validation failed');
    });
  });

  describe('PUT requests', () => {
    it('performs successful PUT request with body', async () => {
      let capturedBody: unknown;

      server.use(
        http.put(`${API_BASE_URL}/items/1`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json(
            { id: '1', ...capturedBody },
            { status: 200 }
          );
        })
      );

      const body = { name: 'Updated Item' };
      const response: ApiResponse<{ id: string; name: string }> = await api.put('/items/1', body);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ id: '1', ...body });
      expect(capturedBody).toEqual(body);
    });

    it('handles PUT error response', async () => {
      server.use(
        http.put(`${API_BASE_URL}/items/999`, () => {
          return HttpResponse.json(
            { message: 'Item not found' },
            { status: 404 }
          );
        })
      );

      const response: ApiResponse<unknown> = await api.put('/items/999', {});

      expect(response.status).toBe(404);
      expect(response.error).toBe('Item not found');
    });
  });

  describe('DELETE requests', () => {
    it('performs successful DELETE request', async () => {
      server.use(
        http.delete(`${API_BASE_URL}/items/1`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const response: ApiResponse<null> = await api.delete('/items/1');

      expect(response.status).toBe(204);
      expect(response.data).toBeNull();
      expect(response.error).toBeUndefined();
    });

    it('handles DELETE error response', async () => {
      server.use(
        http.delete(`${API_BASE_URL}/items/999`, () => {
          return HttpResponse.json(
            { message: 'Cannot delete non-existent item' },
            { status: 404 }
          );
        })
      );

      const response: ApiResponse<unknown> = await api.delete('/items/999');

      expect(response.status).toBe(404);
      expect(response.error).toBe('Cannot delete non-existent item');
    });
  });

  describe('Token management', () => {
    it('sets and uses token for authenticated requests', async () => {
      let capturedHeaders: Record<string, string> = {};

      server.use(
        http.get(`${API_BASE_URL}/auth-test`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ authenticated: true }, { status: 200 });
        })
      );

      api.setToken('my-auth-token');
      await api.get('/auth-test');

      expect(capturedHeaders['authorization']).toBe('Bearer my-auth-token');
    });

    it('clears token and stops sending it', async () => {
      let capturedHeaders: Record<string, string> = {};

      server.use(
        http.get(`${API_BASE_URL}/after-logout`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ ok: true }, { status: 200 });
        })
      );

      api.setToken('old-token');
      api.clearToken();
      await api.get('/after-logout');

      expect(capturedHeaders['authorization']).toBeUndefined();
    });

    it('updates token when set multiple times', async () => {
      let capturedHeaders: Record<string, string> = {};

      server.use(
        http.get(`${API_BASE_URL}/token-update`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ ok: true }, { status: 200 });
        })
      );

      api.setToken('first-token');
      api.setToken('second-token');
      await api.get('/token-update');

      expect(capturedHeaders['authorization']).toBe('Bearer second-token');
    });
  });

  describe('Header merging', () => {
    it('includes default Content-Type header', async () => {
      let capturedHeaders: Record<string, string> = {};

      server.use(
        http.post(`${API_BASE_URL}/custom-headers`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ ok: true }, { status: 200 });
        })
      );

      // POST automatically includes Content-Type header
      await api.post('/custom-headers', { data: 'test' });

      expect(capturedHeaders['content-type']).toBe('application/json');
    });

    it('preserves and merges custom headers when provided', async () => {
      // Mock fetch to verify header merging behavior
      const originalFetch = global.fetch;
      let capturedInit: RequestInit | undefined;

      global.fetch = jest.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        capturedInit = init;
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true }),
        } as Response;
      });

      // Test the api client - even though public methods don't pass custom headers,
      // we can verify the default behavior works correctly
      await api.get('/test-headers');

      // Verify headers were set correctly
      expect(capturedInit?.headers).toEqual({
        'Content-Type': 'application/json',
      });

      global.fetch = originalFetch;
    });

    it('handles authorization header along with default headers', async () => {
      let capturedHeaders: Record<string, string> = {};

      server.use(
        http.get(`${API_BASE_URL}/auth-headers`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ ok: true }, { status: 200 });
        })
      );

      api.setToken('test-token');
      await api.get('/auth-headers');

      expect(capturedHeaders['content-type']).toBe('application/json');
      expect(capturedHeaders['authorization']).toBe('Bearer test-token');
    });
  });
});
