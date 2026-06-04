import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { mechanicPartsApi } from '@/features/mechanic/api/mechanicParts.api';
import type { PartSearchResultDto } from '@/features/mechanic/types/mechanicParts.types';

const MIN_TERM_LENGTH = 2;
const DEBOUNCE_MS = 350;

export interface UseMechanicPartSearchResult {
  term: string;
  setTerm: (value: string) => void;
  results: PartSearchResultDto[];
  isSearching: boolean;
  searchError: string | null;
  minTermLength: number;
  canSearch: boolean;
}

export function useMechanicPartSearch(initialTerm = ''): UseMechanicPartSearchResult {
  const [term, setTerm] = useState(initialTerm);
  const [results, setResults] = useState<PartSearchResultDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const normalized = term.trim();
  const canSearch = normalized.length >= MIN_TERM_LENGTH;

  useEffect(() => {
    if (!canSearch) {
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      setSearchError(null);

      mechanicPartsApi
        .searchParts(normalized)
        .then((response) => setResults(response.data))
        .catch((err) => {
          setResults([]);
          setSearchError(getErrorMessage(err));
        })
        .finally(() => setIsSearching(false));
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [canSearch, normalized]);

  return {
    term,
    setTerm,
    results,
    isSearching,
    searchError,
    minTermLength: MIN_TERM_LENGTH,
    canSearch,
  };
}
