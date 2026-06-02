import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { SelectOption } from '@/features/mechanic/utils/activeOrderStatusFilter';
import type { MechanicActiveOrderFiltersState } from '@/features/mechanic/types/mechanicActiveOrders.types';

export interface MechanicActiveOrderFiltersProps {
  filters: MechanicActiveOrderFiltersState;
  statusFilterOptions: SelectOption[];
  resultCount: number;
  onChange: (next: MechanicActiveOrderFiltersState) => void;
}

export function MechanicActiveOrderFilters({
  filters,
  statusFilterOptions,
  resultCount,
  onChange,
}: MechanicActiveOrderFiltersProps) {

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-bg-surface p-4">
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="relative lg:col-span-2">
          <Search
            className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted"
            aria-hidden
          />
          <Input
            name="activeOrderSearch"
            label="Search"
            placeholder="Filter by order ID, vehicle ID, description, or status…"
            value={filters.searchTerm}
            onChange={(event) =>
              onChange({ ...filters, searchTerm: event.target.value })
            }
            className="pl-9"
          />
        </div>

        <Select
          name="orderStatusFilter"
          label="Active status"
          value={filters.orderStatusId?.toString() ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              orderStatusId: event.target.value ? Number(event.target.value) : null,
            })
          }
          options={statusFilterOptions}
        />
      </div>

      <p className="text-xs text-text-secondary">
        {resultCount} active order{resultCount === 1 ? '' : 's'} shown. This list excludes
        completed, cancelled, and voided orders; the status filter only includes statuses that
        can appear here.
      </p>
    </div>
  );
}
