import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Check, ChevronDown, Search, User } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { personsApi } from '@/features/admin/api/persons.api';
import type { PersonDto } from '@/features/admin/types/persons.types';
import {
  formatPersonPrimaryLabel,
  formatPersonSecondaryLabel,
  personMatchesSearch,
} from '@/features/admin/types/persons.types';
import { cn } from '@/lib/cn';

export interface PersonSelectorProps {
  value: number | null;
  onChange: (personId: number | null) => void;
  /** Person IDs that already have a user account (from GET /api/users). */
  linkedPersonIds?: ReadonlySet<number>;
  /** When editing, allow selecting the person already linked to this user. */
  allowLinkedPersonId?: number;
  error?: string;
  disabled?: boolean;
}

function isPersonUnavailable(
  person: PersonDto,
  linkedPersonIds: ReadonlySet<number>,
  allowLinkedPersonId?: number,
): boolean {
  if (!linkedPersonIds.has(person.personId)) {
    return false;
  }
  return person.personId !== allowLinkedPersonId;
}

export function PersonSelector({
  value,
  onChange,
  linkedPersonIds = new Set<number>(),
  allowLinkedPersonId,
  error,
  disabled = false,
}: PersonSelectorProps) {
  const listboxId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [persons, setPersons] = useState<PersonDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const loadPersons = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await personsApi.getAll();
      setPersons(response.data);
    } catch (err) {
      setLoadError(getErrorMessage(err));
      setPersons([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPersons();
  }, []);

  const selectedPerson = useMemo(
    () => persons.find((person) => person.personId === value) ?? null,
    [persons, value],
  );

  const filteredPersons = useMemo(() => {
    return persons.filter((person) => personMatchesSearch(person, searchTerm));
  }, [persons, searchTerm]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm, isOpen]);

  const selectPerson = (person: PersonDto) => {
    if (
      isPersonUnavailable(person, linkedPersonIds, allowLinkedPersonId) ||
      disabled
    ) {
      return;
    }

    onChange(person.personId);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (!isOpen || filteredPersons.length === 0) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex((current) =>
          current >= filteredPersons.length - 1 ? 0 : current + 1,
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex((current) =>
          current <= 0 ? filteredPersons.length - 1 : current - 1,
        );
        break;
      case 'Enter': {
        event.preventDefault();
        const person = filteredPersons[highlightedIndex];
        if (person) selectPerson(person);
        break;
      }
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const helperText =
    'A user account must be linked to an existing person record.';

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-primary">
          Person
          <span className="ml-0.5 text-accent" aria-hidden>
            *
          </span>
        </span>
        <LoadingState
          title="Loading persons"
          description="Fetching person records for selection…"
          size="sm"
          className="min-h-[160px] rounded-lg border border-border bg-bg-input/40"
        />
        <p className="text-xs text-text-secondary">{helperText}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-primary">
          Person
          <span className="ml-0.5 text-accent" aria-hidden>
            *
          </span>
        </span>
        <ErrorState
          title="Unable to load persons"
          message={loadError}
          onRetry={() => void loadPersons()}
          className="py-8"
        />
        <p className="text-xs text-text-secondary">{helperText}</p>
      </div>
    );
  }

  if (persons.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-primary">
          Person
          <span className="ml-0.5 text-accent" aria-hidden>
            *
          </span>
        </span>
        <EmptyState
          title="No existing persons available"
          description="Create a staff member or client first before creating a user account."
          className="rounded-lg border border-border bg-bg-input/40 py-10"
        />
        <p className="text-xs text-text-secondary">{helperText}</p>
        {error && (
          <p className="text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${listboxId}-search`}
          className="text-sm font-medium text-text-primary"
        >
          Person
          <span className="ml-0.5 text-accent" aria-hidden>
            *
          </span>
        </label>
        <p className="text-xs text-text-secondary">{helperText}</p>
      </div>

      {selectedPerson && (
        <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent-muted/20 px-3 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent">
            <User className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              {formatPersonPrimaryLabel(selectedPerson)}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {formatPersonSecondaryLabel(selectedPerson)}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              This person will receive the login account.
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              className="shrink-0 text-xs font-medium text-accent hover:text-accent-hover"
              onClick={() => {
                onChange(null);
                setSearchTerm('');
                setIsOpen(true);
                searchInputRef.current?.focus();
              }}
            >
              Change
            </button>
          )}
        </div>
      )}

      {(!selectedPerson || isOpen) && (
        <div className="relative">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
              aria-hidden
            />
            <Input
              ref={searchInputRef}
              id={`${listboxId}-search`}
              name="person-search"
              placeholder="Search by name, document number, or ID…"
              value={searchTerm}
              disabled={disabled}
              aria-invalid={Boolean(error)}
              aria-expanded={isOpen}
              aria-controls={`${listboxId}-listbox`}
              aria-autocomplete="list"
              role="combobox"
              className="pl-9 pr-10"
              onFocus={() => setIsOpen(true)}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setIsOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
            />
            <ChevronDown
              className={cn(
                'pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted transition-transform',
                isOpen && 'rotate-180',
              )}
              aria-hidden
            />
          </div>

          {isOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Close person list"
                onClick={() => setIsOpen(false)}
              />
              <ul
                id={`${listboxId}-listbox`}
                role="listbox"
                aria-label="Available persons"
                className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-bg-surface shadow-lg"
              >
                {filteredPersons.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-text-secondary">
                    No persons match your search.
                  </li>
                ) : (
                  filteredPersons.map((person, index) => {
                    const unavailable = isPersonUnavailable(
                      person,
                      linkedPersonIds,
                      allowLinkedPersonId,
                    );
                    const isSelected = value === person.personId;
                    const isHighlighted = index === highlightedIndex;

                    return (
                      <li key={person.personId} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          disabled={unavailable || disabled}
                          className={cn(
                            'flex w-full items-start gap-3 border-b border-border px-3 py-3 text-left last:border-b-0',
                            unavailable
                              ? 'cursor-not-allowed opacity-50'
                              : 'hover:bg-bg-elevated/60',
                            isHighlighted && !unavailable && 'bg-bg-elevated/60',
                            isSelected && 'bg-accent-muted/20',
                          )}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onClick={() => selectPerson(person)}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-text-primary">
                                {formatPersonPrimaryLabel(person)}
                              </span>
                              {unavailable && (
                                <Badge variant="default">Has account</Badge>
                              )}
                              {isSelected && (
                                <Badge variant="accent">Selected</Badge>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-text-secondary">
                              {formatPersonSecondaryLabel(person)}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="size-4 shrink-0 text-accent" aria-hidden />
                          )}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
