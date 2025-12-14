/**
 * Tests for useApi hook.
 *
 * Tests the basic API hook that handles data fetching with loading and error states.
 * This hook uses the api service directly (not React Query).
 */

import { renderHook, waitFor } from '../utils/test-utils';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';

// Mock the api service
jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockApiGet = api.get as jest.MockedFunction<typeof api.get>;

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockReset();
  });

  it('fetches data immediately by default', async () => {
    const mockData = { id: '1', name: 'Test Item' };
    mockApiGet.mockResolvedValueOnce({
      data: mockData,
      status: 200,
    });

    const { result } = renderHook(() => useApi('/test-endpoint'));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockApiGet).toHaveBeenCalledWith('/test-endpoint');
  });

  it('does not fetch immediately when immediate is false', () => {
    mockApiGet.mockResolvedValueOnce({
      data: { id: '1' },
      status: 200,
    });

    const { result } = renderHook(() =>
      useApi('/test-endpoint', { immediate: false })
    );

    // Should not be loading since immediate is false
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('handles API errors', async () => {
    const errorMessage = 'Failed to fetch data';
    mockApiGet.mockResolvedValueOnce({
      data: null as any,
      error: errorMessage,
      status: 500,
    });

    const { result } = renderHook(() => useApi('/error-endpoint'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // When there's an error, data is not updated (stays null since it was never set)
    expect(result.current.error).toBe(errorMessage);
  });

  it('executes fetch manually when immediate is false', async () => {
    const mockData = { id: '2', name: 'Manual Fetch' };
    mockApiGet.mockResolvedValueOnce({
      data: mockData,
      status: 200,
    });

    const { result } = renderHook(() =>
      useApi('/manual-endpoint', { immediate: false })
    );

    expect(mockApiGet).not.toHaveBeenCalled();

    // Manually trigger the fetch
    await result.current.execute();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiGet).toHaveBeenCalledWith('/manual-endpoint');
  });

  it('returns the response from execute', async () => {
    const mockData = { id: '3', name: 'Execute Response' };
    const mockResponse = {
      data: mockData,
      status: 200,
    };
    mockApiGet.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() =>
      useApi('/execute-endpoint', { immediate: false })
    );

    const response = await result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(response).toEqual(mockResponse);
  });

  it('clears error when executing again after a failure', async () => {
    const errorMessage = 'First error';
    mockApiGet.mockResolvedValueOnce({
      data: null as any,
      error: errorMessage,
      status: 500,
    });

    const { result } = renderHook(() => useApi('/retry-endpoint'));

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });

    // Mock successful response for retry
    const successData = { id: '4', name: 'Success' };
    mockApiGet.mockResolvedValueOnce({
      data: successData,
      status: 200,
    });

    // Execute again
    await result.current.execute();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(successData);
      expect(result.current.loading).toBe(false);
    });
  });

  it('re-fetches when endpoint changes', async () => {
    const mockData1 = { id: '1', name: 'First' };
    const mockData2 = { id: '2', name: 'Second' };

    mockApiGet.mockResolvedValueOnce({
      data: mockData1,
      status: 200,
    });

    const { result, rerender } = renderHook(
      ({ endpoint }) => useApi(endpoint),
      { initialProps: { endpoint: '/endpoint-1' } }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
      expect(result.current.loading).toBe(false);
    });

    // Mock response for second endpoint
    mockApiGet.mockResolvedValueOnce({
      data: mockData2,
      status: 200,
    });

    // Change endpoint
    rerender({ endpoint: '/endpoint-2' });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiGet).toHaveBeenCalledWith('/endpoint-1');
    expect(mockApiGet).toHaveBeenCalledWith('/endpoint-2');
    expect(mockApiGet).toHaveBeenCalledTimes(2);
  });

  it('sets loading state during fetch', async () => {
    mockApiGet.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ data: { id: '1' }, status: 200 }),
            100
          )
        )
    );

    const { result } = renderHook(() => useApi('/slow-endpoint'));

    // Should be loading initially
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: '1' });
  });

  it('handles network errors', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: null as any,
      error: 'Network error',
      status: 0,
    });

    const { result } = renderHook(() => useApi('/network-error'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('preserves data when fetching fails', async () => {
    const initialData = { id: '1', name: 'Initial' };
    mockApiGet.mockResolvedValueOnce({
      data: initialData,
      status: 200,
    });

    const { result } = renderHook(() =>
      useApi('/preserve-endpoint', { immediate: false })
    );

    // First successful fetch
    await result.current.execute();
    await waitFor(() => {
      expect(result.current.data).toEqual(initialData);
      expect(result.current.loading).toBe(false);
    });

    // Mock error for second fetch
    mockApiGet.mockResolvedValueOnce({
      data: null as any,
      error: 'Fetch failed',
      status: 500,
    });

    // Execute again
    await result.current.execute();
    await waitFor(() => {
      expect(result.current.error).toBe('Fetch failed');
      expect(result.current.loading).toBe(false);
    });

    // Data should still be the initial data
    expect(result.current.data).toEqual(initialData);
  });
});
