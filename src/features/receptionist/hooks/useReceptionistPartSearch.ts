import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { receptionistInventoryApi } from '@/features/receptionist/api/receptionistInventory.api';
import type { PartSearchResultDto } from '@/features/receptionist/types/receptionistInventory.types';

export interface UseReceptionistPartSearchParams {
  minTermLength?: number;
}

export interface UseReceptionistPartSearchResult {
  term: string;
  setTerm: (value: string) => void;
  results: PartSearchResultDto[];
  isSearching: boolean;
  error: string | null;
  hasSearched: boolean;
  termTooShort: boolean;
  minTermLength: number;
  reload: () => void;
}

const DEFAULT_MIN_TERM_LENGTH = 2;

export function useReceptionistPartSearch(
  params: UseReceptionistPartSearchParams = {},
): UseReceptionistPartSearchResult {
  const minTermLength = params.minTermLength ?? DEFAULT_MIN_TERM_LENGTH;

  const [term, setTerm] = useState('');
  const [results, setResults] = useState<PartSearchResultDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
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

    const timer = window.setTimeout(() => {
      setIsSearching(true);
      setError(null);

      receptionistInventoryApi
        .searchParts(normalizedTerm)
        .then((response) => {
          setResults(response.data);
          setHasSearched(true);
        })
        .catch((searchError) => {
          setResults([]);
          setError(getErrorMessage(searchError));
          setHasSearched(true);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 350);

    return () => window.clearTimeout(timer);
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
