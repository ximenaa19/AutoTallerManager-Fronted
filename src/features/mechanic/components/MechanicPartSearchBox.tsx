import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export interface MechanicPartSearchBoxProps {
  term: string;
  onTermChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  isSearching?: boolean;
  searchError?: string | null;
  minTermLength?: number;
}

export function MechanicPartSearchBox({
  term,
  onTermChange,
  label = 'Search parts',
  placeholder = 'Search by code or description (min. 2 characters)…',
  isSearching = false,
  searchError = null,
  minTermLength = 2,
}: MechanicPartSearchBoxProps) {
  const trimmed = term.trim();
  const showMinLengthHint =
    trimmed.length > 0 && trimmed.length < minTermLength;

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted"
        aria-hidden
      />
      <Input
        name="partSearch"
        label={label}
        placeholder={placeholder}
        value={term}
        onChange={(event) => onTermChange(event.target.value)}
        className="pl-9"
      />
      {showMinLengthHint && (
        <p className="mt-1 text-xs text-text-secondary">
          Type at least {minTermLength} characters to search.
        </p>
      )}
      {isSearching && (
        <p className="mt-1 text-xs text-text-secondary">Searching parts…</p>
      )}
      {searchError && (
        <p role="alert" className="mt-1 text-xs text-danger">
          {searchError}
        </p>
      )}
    </div>
  );
}
