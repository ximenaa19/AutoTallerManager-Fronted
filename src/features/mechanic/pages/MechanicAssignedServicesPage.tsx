import { useMemo, useState } from 'react';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { useWorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { MechanicAssignmentFilters } from '@/features/mechanic/components/MechanicAssignmentFilters';
import { MechanicEmptyState } from '@/features/mechanic/components/MechanicEmptyState';
import { MechanicWorkBoard } from '@/features/mechanic/components/MechanicWorkBoard';
import { getWorkReportStatus } from '@/features/mechanic/utils/workReportStatus';
import { useMechanicAssignments } from '@/features/mechanic/hooks/useMechanicAssignments';
import type {
  MechanicAssignedServiceDto,
  MechanicAssignmentFiltersState,
} from '@/features/mechanic/types/mechanicAssignments.types';

const defaultFilters: MechanicAssignmentFiltersState = {
  searchTerm: '',
  serviceTypeId: null,
  specialtyId: null,
  workReportFilter: 'all',
};

function filterAssignments(
  assignments: MechanicAssignedServiceDto[],
  filters: MechanicAssignmentFiltersState,
  lookups: ReturnType<typeof useWorkshopCatalogLookups>['lookups'],
): MechanicAssignedServiceDto[] {
  const normalizedSearch = filters.searchTerm.trim().toLowerCase();

  return assignments.filter((assignment) => {
    if (
      filters.serviceTypeId !== null &&
      assignment.serviceTypeId !== filters.serviceTypeId
    ) {
      return false;
    }

    if (
      filters.specialtyId !== null &&
      assignment.specialtyId !== filters.specialtyId
    ) {
      return false;
    }

    const workReportStatus = getWorkReportStatus(assignment.workPerformed);
    if (
      filters.workReportFilter === 'needs-report' &&
      workReportStatus !== 'needs-report'
    ) {
      return false;
    }

    if (
      filters.workReportFilter === 'reported' &&
      workReportStatus !== 'reported'
    ) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const serviceTypeName =
      lookups.serviceTypeNameById.get(assignment.serviceTypeId) ?? '';
    const specialtyName =
      lookups.specialtyNameById.get(assignment.specialtyId) ?? '';

    const haystack = [
      String(assignment.orderServiceId),
      String(assignment.serviceOrderId),
      String(assignment.vehicleId),
      assignment.description,
      assignment.workPerformed,
      serviceTypeName,
      specialtyName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}

function hasActiveFilters(filters: MechanicAssignmentFiltersState): boolean {
  return (
    filters.searchTerm.trim().length > 0 ||
    filters.serviceTypeId !== null ||
    filters.specialtyId !== null ||
    filters.workReportFilter !== 'all'
  );
}

export function MechanicAssignedServicesPage() {
  const [filters, setFilters] = useState<MechanicAssignmentFiltersState>(defaultFilters);
  const { data, isLoading, error, retry } = useMechanicAssignments();
  const {
    lookups,
    isLoading: catalogsLoading,
    error: catalogsError,
    retry: retryCatalogs,
  } = useWorkshopCatalogLookups();

  const assignments = useMemo(() => data ?? [], [data]);

  const filteredAssignments = useMemo(
    () => filterAssignments(assignments, filters, lookups),
    [assignments, filters, lookups],
  );

  if (isLoading || catalogsLoading) {
    return (
      <LoadingState
        title="Loading assigned services"
        description="Fetching your assigned work from the workshop…"
        className="min-h-[420px]"
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load assigned services"
        message={error}
        onRetry={retry}
      />
    );
  }

  if (catalogsError) {
    return (
      <ErrorState
        title="Unable to load service labels"
        message={catalogsError}
        onRetry={retryCatalogs}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Assigned Services"
        description="Work allocated to you via mechanic assignments. Only services linked to your account are shown."
      />

      <MechanicAssignmentFilters
        filters={filters}
        lookups={lookups}
        resultCount={filteredAssignments.length}
        onChange={setFilters}
      />

      {assignments.length === 0 ? (
        <MechanicEmptyState
          title="No assigned services"
          description="When reception or admin assigns you to an order service, it will appear here."
        />
      ) : (
        <MechanicWorkBoard
          assignments={filteredAssignments}
          lookups={lookups}
          hasActiveFilters={hasActiveFilters(filters)}
        />
      )}
    </div>
  );
}
