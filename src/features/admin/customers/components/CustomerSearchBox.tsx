import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Input } from '@/components/ui/Input';
import { customersApi } from '@/features/admin/customers/api/customers.api';
import type { ClientSearchResultDto } from '@/features/admin/customers/types/customers.types';
import { cn } from '@/lib/cn';

export interface CustomerSearchBoxProps {
  onSelect: (result: ClientSearchResultDto) => void;
  className?: string;
}

export function CustomerSearchBox({ onSelect, className }: CustomerSearchBoxProps) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<ClientSearchResultDto[]>([]);
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

      customersApi
        .searchClients(normalized)
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
          name="customer-api-search"
          label="Quick client search"
          placeholder="Search by name, document, email, or phone (min. 2 chars)…"
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
        <p className="text-xs text-text-secondary">Searching clients…</p>
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
                <span className="text-sm font-medium text-text-primary">
                  {result.fullName}
                </span>
                <span className="text-xs text-text-secondary">
                  #{result.personId} · Doc {result.documentNumber}
                  {result.primaryEmail ? ` · ${result.primaryEmail}` : ''}
                  {result.primaryPhoneNumber ? ` · ${result.primaryPhoneNumber}` : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
