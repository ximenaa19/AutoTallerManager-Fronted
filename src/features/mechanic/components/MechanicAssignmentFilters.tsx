import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import type {
  MechanicAssignmentFiltersState,
  MechanicWorkReportFilter,
} from '@/features/mechanic/types/mechanicAssignments.types';

export interface MechanicAssignmentFiltersProps {
  filters: MechanicAssignmentFiltersState;
  lookups: WorkshopCatalogLookups;
  resultCount: number;
  onChange: (next: MechanicAssignmentFiltersState) => void;
}

const workReportOptions = [
  { value: 'all', label: 'All work states' },
  { value: 'needs-report', label: 'Needs work report' },
  { value: 'reported', label: 'Work recorded' },
];

export function MechanicAssignmentFilters({
  filters,
  lookups,
  resultCount,
  onChange,
}: MechanicAssignmentFiltersProps) {
  const serviceTypeOptions = [
    { value: '', label: 'All service types' },
    ...lookups.serviceTypes.map((item) => ({
      value: String(item.id),
      label: item.name,
    })),
  ];

  const specialtyOptions = [
    { value: '', label: 'All specialties' },
    ...lookups.mechanicSpecialties.map((item) => ({
      value: String(item.id),
      label: item.name,
    })),
  ];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-bg-surface p-4">
      <div className="grid gap-3 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search
            className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted"
            aria-hidden
          />
          <Input
            name="assignmentSearch"
            label="Search"
            placeholder="Filter by order ID, service ID, description, or work performed…"
            value={filters.searchTerm}
            onChange={(event) =>
              onChange({ ...filters, searchTerm: event.target.value })
            }
            className="pl-9"
          />
        </div>

        <Select
          name="serviceTypeFilter"
          label="Service type"
          value={filters.serviceTypeId?.toString() ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              serviceTypeId: event.target.value ? Number(event.target.value) : null,
            })
          }
          options={serviceTypeOptions}
        />

        <Select
          name="specialtyFilter"
          label="Specialty"
          value={filters.specialtyId?.toString() ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              specialtyId: event.target.value ? Number(event.target.value) : null,
            })
          }
          options={specialtyOptions}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Select
          name="workReportFilter"
          label="Work report"
          value={filters.workReportFilter}
          onChange={(event) =>
            onChange({
              ...filters,
              workReportFilter: event.target.value as MechanicWorkReportFilter,
            })
          }
          options={workReportOptions}
          className="sm:max-w-xs"
        />
        <p className="pb-2 text-xs text-text-secondary">
          {resultCount} assignment{resultCount === 1 ? '' : 's'} shown
        </p>
      </div>
    </div>
  );
}
