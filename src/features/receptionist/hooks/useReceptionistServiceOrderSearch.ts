import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { receptionistServiceOrdersApi } from '@/features/receptionist/api/receptionistServiceOrders.api';
import type { ServiceOrderSearchResultDto } from '@/features/receptionist/types/receptionistServiceOrders.types';

export interface UseReceptionistServiceOrderSearchParams {
  minTermLength?: number;
}

export interface UseReceptionistServiceOrderSearchResult {
  term: string;
  setTerm: (value: string) => void;
  results: ServiceOrderSearchResultDto[];
  isSearching: boolean;
  error: string | null;
  hasSearched: boolean;
  termTooShort: boolean;
  minTermLength: number;
  reload: () => void;
}

const DEFAULT_MIN_TERM_LENGTH = 2;

export function useReceptionistServiceOrderSearch(
  params: UseReceptionistServiceOrderSearchParams = {},
): UseReceptionistServiceOrderSearchResult {
  const minTermLength = params.minTermLength ?? DEFAULT_MIN_TERM_LENGTH;

  const [term, setTerm] = useState('');
  const [results, setResults] = useState<ServiceOrderSearchResultDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const normalizedTerm = term.trim();
    const isBelowMin = normalizedTerm.length > 0 && normalizedTerm.length < minTermLength;

    if (!normalizedTerm || isBelowMin) {
      setResults([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      setError(null);

      receptionistServiceOrdersApi
        .searchServiceOrders(normalizedTerm)
        .then((response) => {
          setResults(response.data);
          setHasSearched(true);
        })
        .catch((err) => {
          setResults([]);
          setError(getErrorMessage(err));
          setHasSearched(true);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [term, minTermLength, reloadToken]);

  return {
    term,
    setTerm: (value) => setTerm(value),
    results,
    isSearching,
    error,
    hasSearched,
    termTooShort: term.trim().length > 0 && term.trim().length < minTermLength,
    minTermLength,
    reload,
  };
}
