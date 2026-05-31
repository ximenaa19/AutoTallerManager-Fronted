import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';

interface UseAsyncRequestResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useAsyncRequest<T>(
  fetcher: () => Promise<{ data: T }>,
  deps: unknown[] = [],
): UseAsyncRequestResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetcher();
      setData(response.data);
    } catch (err) {
      setData(null);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls invalidation via deps
  }, deps);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, error, retry: () => void load() };
}
