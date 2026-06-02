import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { AuditActionTypeDto } from '@/features/admin/catalogs/types/catalogs.types';
import type { AuditListSource } from '@/features/admin/reports/hooks/useAuditData';

export interface AuditFiltersState {
  searchTerm: string;
  actionTypeId: string;
  listSource: AuditListSource;
  userId: string;
  entity: string;
  recordId: string;
}

export interface AuditFiltersProps {
  filters: AuditFiltersState;
  actionTypes: AuditActionTypeDto[];
  onChange: (filters: AuditFiltersState) => void;
  onApplyServerFilters: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function AuditFilters({
  filters,
  actionTypes,
  onChange,
  onApplyServerFilters,
  onReset,
  isLoading = false,
}: AuditFiltersProps) {
  const actionTypeOptions = [
    { value: '', label: 'All action types' },
    ...actionTypes.map((type) => ({
      value: String(type.auditActionTypeId),
      label: type.name,
    })),
  ];

  const listSourceOptions = [
    { value: 'all', label: 'All audit records' },
    { value: 'recent', label: 'Recent (last 50)' },
    { value: 'by-user', label: 'By user ID (API)' },
    { value: 'by-entity', label: 'By entity + record (API)' },
  ];

  return (
    <section className="rounded-lg border border-border bg-bg-surface p-5">
      <div className="mb-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Filter className="size-4 text-accent" aria-hidden />
          Filters
        </div>
        <p className="text-sm text-text-secondary">
          Search and action type filters apply on the client. User and entity filters
          call the admin audit query API when you apply the data source.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted"
            aria-hidden
          />
          <Input
            name="auditSearch"
            label="Search"
            placeholder="ID, entity, description, user…"
            value={filters.searchTerm}
            onChange={(event) =>
              onChange({ ...filters, searchTerm: event.target.value })
            }
            className="pl-9"
          />
        </div>

        <Select
          name="auditActionType"
          label="Action type"
          value={filters.actionTypeId}
          onChange={(event) =>
            onChange({ ...filters, actionTypeId: event.target.value })
          }
          options={actionTypeOptions}
        />

        <Select
          name="auditListSource"
          label="Data source"
          value={filters.listSource}
          onChange={(event) =>
            onChange({
              ...filters,
              listSource: event.target.value as AuditListSource,
            })
          }
          options={listSourceOptions}
        />

        {filters.listSource === 'by-user' && (
          <Input
            name="auditUserId"
            label="User ID"
            type="number"
            min={1}
            value={filters.userId}
            onChange={(event) =>
              onChange({ ...filters, userId: event.target.value })
            }
          />
        )}

        {filters.listSource === 'by-entity' && (
          <>
            <Input
              name="auditEntity"
              label="Affected entity"
              placeholder="e.g. ServiceOrder"
              value={filters.entity}
              onChange={(event) =>
                onChange({ ...filters, entity: event.target.value })
              }
            />
            <Input
              name="auditRecordId"
              label="Record ID"
              type="number"
              min={1}
              value={filters.recordId}
              onChange={(event) =>
                onChange({ ...filters, recordId: event.target.value })
              }
            />
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={onApplyServerFilters}
          isLoading={isLoading}
        >
          Load audits
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={isLoading}>
          Reset filters
        </Button>
      </div>
    </section>
  );
}
