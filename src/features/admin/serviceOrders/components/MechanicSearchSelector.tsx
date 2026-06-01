import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  serviceOrderLookupsApi,
  type MechanicSearchResultDto,
} from '@/features/admin/serviceOrders/api/serviceOrderLookups.api';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import { cn } from '@/lib/cn';

export interface MechanicSearchSelectorProps {
  value: { mechanicPersonId: number; specialtyId: number } | null;
  onChange: (value: { mechanicPersonId: number; specialtyId: number } | null) => void;
  lookups: WorkshopCatalogLookups;
  error?: string;
  className?: string;
}

export function MechanicSearchSelector({
  value,
  onChange,
  lookups,
  error,
  className,
}: MechanicSearchSelectorProps) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<MechanicSearchResultDto[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<MechanicSearchResultDto | null>(
    null,
  );
  const [specialtyId, setSpecialtyId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const normalized = term.trim();
    if (normalized.length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      setSearchError(null);

      serviceOrderLookupsApi
        .searchMechanics(normalized)
        .then((response) => setResults(response.data))
        .catch((err) => {
          setResults([]);
          setSearchError(getErrorMessage(err));
        })
        .finally(() => setIsSearching(false));
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [term]);

  const handleSelectMechanic = (mechanic: MechanicSearchResultDto) => {
    setSelectedMechanic(mechanic);
    setResults([]);
    setTerm(mechanic.fullName);

    const defaultSpecialty = mechanic.specialtyIds[0];
    if (defaultSpecialty) {
      setSpecialtyId(String(defaultSpecialty));
      onChange({ mechanicPersonId: mechanic.personId, specialtyId: defaultSpecialty });
    } else {
      setSpecialtyId('');
      onChange(null);
    }
  };

  const handleSpecialtyChange = (nextSpecialtyId: string) => {
    setSpecialtyId(nextSpecialtyId);
    const parsed = Number(nextSpecialtyId);
    if (selectedMechanic && Number.isFinite(parsed) && parsed > 0) {
      onChange({ mechanicPersonId: selectedMechanic.personId, specialtyId: parsed });
    } else {
      onChange(null);
    }
  };

  const specialtyOptions =
    selectedMechanic?.specialtyIds.map((id) => ({
      value: String(id),
      label: lookups.specialtyNameById.get(id) ?? `Specialty #${id}`,
    })) ?? [];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted"
          aria-hidden
        />
        <Input
          name="mechanicSearch"
          label="Search mechanic"
          placeholder="Search by name or document (min. 2 chars)…"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            if (selectedMechanic && event.target.value !== selectedMechanic.fullName) {
              setSelectedMechanic(null);
              setSpecialtyId('');
              onChange(null);
            }
          }}
          className="pl-9"
          error={error ?? searchError ?? undefined}
        />
      </div>

      {isSearching && <p className="text-xs text-text-secondary">Searching mechanics…</p>}

      {results.length > 0 && (
        <ul className="max-h-48 overflow-y-auto rounded-lg border border-border bg-bg-elevated">
          {results.map((mechanic) => (
            <li key={mechanic.personId} className="border-b border-border last:border-b-0">
              <button
                type="button"
                className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-bg-muted"
                onClick={() => handleSelectMechanic(mechanic)}
              >
                <span className="text-sm font-medium text-text-primary">
                  {mechanic.fullName}
                </span>
                <span className="text-xs text-text-secondary">
                  #{mechanic.personId} · Doc {mechanic.documentNumber}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedMechanic && (
        <Select
          name="mechanicSpecialty"
          label="Specialty for assignment"
          required
          value={specialtyId}
          onChange={(event) => handleSpecialtyChange(event.target.value)}
          options={specialtyOptions}
          placeholder="Select specialty…"
        />
      )}

      {value && selectedMechanic && (
        <p className="text-xs text-success">
          Selected: {selectedMechanic.fullName} ·{' '}
          {lookups.specialtyNameById.get(value.specialtyId) ?? `Specialty #${value.specialtyId}`}
        </p>
      )}
    </div>
  );
}
