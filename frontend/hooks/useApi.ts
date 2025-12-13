import { useState, useEffect } from 'react';
import { api, ApiResponse } from '@/services/api';

interface UseApiOptions {
  immediate?: boolean;
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = { immediate: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);

    const response: ApiResponse<T> = await api.get<T>(endpoint);

    if (response.error) {
      setError(response.error);
    } else {
      setData(response.data);
    }

    setLoading(false);
    return response;
  };

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [endpoint]);

  return { data, loading, error, execute };
}
