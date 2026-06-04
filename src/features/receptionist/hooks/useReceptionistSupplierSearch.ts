import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { receptionistPurchasesApi } from '@/features/receptionist/api/receptionistPurchases.api';
import type { SupplierSearchResultDto } from '@/features/receptionist/types/receptionistPurchases.types';

export interface UseReceptionistSupplierSearchParams {
  minTermLength?: number;
}

export interface UseReceptionistSupplierSearchResult {
  term: string;
  setTerm: (value: string) => void;
  results: SupplierSearchResultDto[];
  isSearching: boolean;
  error: string | null;
  hasSearched: boolean;
  termTooShort: boolean;
  minTermLength: number;
  reload: () => void;
}

const DEFAULT_MIN_TERM_LENGTH = 2;

export function useReceptionistSupplierSearch(
  params: UseReceptionistSupplierSearchParams = {},
): UseReceptionistSupplierSearchResult {
  const minTermLength = params.minTermLength ?? DEFAULT_MIN_TERM_LENGTH;

  const [term, setTerm] = useState('');
  const [results, setResults] = useState<SupplierSearchResultDto[]>([]);
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

      receptionistPurchasesApi
        .searchSuppliers(normalizedTerm)
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
    setTerm,
    results,
    isSearching,
    error,
    hasSearched,
    termTooShort: term.trim().length > 0 && term.trim().length < minTermLength,
    minTermLength,
    reload,
  };
}
