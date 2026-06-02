import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Input } from '@/components/ui/Input';
import { mechanicsApi } from '@/features/admin/mechanics/api/mechanics.api';
import type { MechanicSearchResultDto } from '@/features/admin/mechanics/types/mechanics.types';
import { cn } from '@/lib/cn';

export interface MechanicSearchBoxProps {
  onSelect: (result: MechanicSearchResultDto) => void;
  className?: string;
}

export function MechanicSearchBox({ onSelect, className }: MechanicSearchBoxProps) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<MechanicSearchResultDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalized = term.trim();
    if (normalized.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      setError(null);

      mechanicsApi
        .searchMechanics(normalized)
        .then((response) => {
          setResults(response.data);
        })
        .catch((err) => {
          setResults([]);
          setError(getErrorMessage(err));
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [term]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted"
          aria-hidden
        />
        <Input
          name="mechanic-api-search"
          label="Quick mechanic search"
          placeholder="Search by name or document (min. 2 chars) via GET /api/search/mechanics…"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          className="pl-9"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {isSearching && (
        <p className="text-xs text-text-secondary">Searching mechanics…</p>
      )}

      {results.length > 0 && (
        <ul className="max-h-56 overflow-y-auto rounded-lg border border-border bg-bg-elevated">
          {results.map((result) => (
            <li key={result.personId} className="border-b border-border last:border-b-0">
              <button
                type="button"
                className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-bg-muted"
                onClick={() => onSelect(result)}
              >
                <span className="text-sm font-medium text-text-primary">{result.fullName}</span>
                <span className="text-xs text-text-secondary">
                  #{result.personId} · Doc {result.documentNumber}
                  {result.specialtyIds.length > 0
                    ? ` · ${result.specialtyIds.length} specialt${result.specialtyIds.length === 1 ? 'y' : 'ies'}`
                    : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
