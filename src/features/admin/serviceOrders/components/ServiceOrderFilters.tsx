import { Select } from '@/components/ui/Select';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';

export interface ServiceOrderFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  lookups: WorkshopCatalogLookups;
  resultCount: number;
}

export function ServiceOrderFilters({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  lookups,
  resultCount,
}: ServiceOrderFiltersProps) {
  const statusOptions = [
    { value: '', label: 'All statuses' },
    ...lookups.orderStatuses.map((status) => ({
      value: String(status.id),
      label: status.name,
    })),
  ];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-bg-surface p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
        <div className="relative sm:col-span-2">
          <Search
            className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted"
            aria-hidden
          />
          <Input
            name="serviceOrderSearch"
            label="Search"
            placeholder="Filter by order ID, vehicle, description, or status…"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          name="orderStatusFilter"
          label="Status"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
          options={statusOptions}
        />
        <p className="flex items-end pb-2 text-xs text-text-secondary">
          {resultCount} order{resultCount === 1 ? '' : 's'} shown
        </p>
      </div>
    </div>
  );
}
