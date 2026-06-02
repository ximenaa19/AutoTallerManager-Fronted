import { useMemo, useState } from 'react';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { useWorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { MechanicActiveOrderFilters } from '@/features/mechanic/components/MechanicActiveOrderFilters';
import { MechanicActiveOrdersBoard } from '@/features/mechanic/components/MechanicActiveOrdersBoard';
import { MechanicEmptyState } from '@/features/mechanic/components/MechanicEmptyState';
import { useMechanicActiveOrders } from '@/features/mechanic/hooks/useMechanicActiveOrders';
import type {
  MechanicActiveOrderDto,
  MechanicActiveOrderFiltersState,
} from '@/features/mechanic/types/mechanicActiveOrders.types';

const defaultFilters: MechanicActiveOrderFiltersState = {
  searchTerm: '',
  orderStatusId: null,
};

function filterActiveOrders(
  orders: MechanicActiveOrderDto[],
  filters: MechanicActiveOrderFiltersState,
  orderStatusNameById: Map<number, string>,
): MechanicActiveOrderDto[] {
  const normalizedSearch = filters.searchTerm.trim().toLowerCase();

  return orders.filter((order) => {
    if (
      filters.orderStatusId !== null &&
      order.orderStatusId !== filters.orderStatusId
    ) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const statusName =
      orderStatusNameById.get(order.orderStatusId) ?? '';

    const haystack = [
      String(order.serviceOrderId),
      String(order.vehicleId),
      order.generalDescription,
      statusName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}

function hasActiveFilters(filters: MechanicActiveOrderFiltersState): boolean {
  return (
    filters.searchTerm.trim().length > 0 || filters.orderStatusId !== null
  );
}

export function MechanicActiveOrdersPage() {
  const [filters, setFilters] = useState<MechanicActiveOrderFiltersState>(defaultFilters);
  const { data, isLoading, error, retry } = useMechanicActiveOrders();
  const {
    lookups,
    isLoading: catalogsLoading,
    error: catalogsError,
    retry: retryCatalogs,
  } = useWorkshopCatalogLookups();

  const orders = useMemo(() => data ?? [], [data]);

  const filteredOrders = useMemo(
    () => filterActiveOrders(orders, filters, lookups.orderStatusNameById),
    [orders, filters, lookups.orderStatusNameById],
  );

  if (isLoading || catalogsLoading) {
    return (
      <LoadingState
        title="Loading active orders"
        description="Fetching service orders linked to your assignments…"
        className="min-h-[420px]"
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load active orders"
        message={error}
        onRetry={retry}
      />
    );
  }

  if (catalogsError) {
    return (
      <ErrorState
        title="Unable to load order status labels"
        message={catalogsError}
        onRetry={retryCatalogs}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Active Orders"
        description="Service orders in progress that include work assigned to you. Excludes completed, cancelled, and voided orders per the workshop API."
      />

      <MechanicActiveOrderFilters
        filters={filters}
        lookups={lookups}
        resultCount={filteredOrders.length}
        onChange={setFilters}
      />

      {orders.length === 0 ? (
        <MechanicEmptyState
          title="No active orders"
          description="When you are assigned to services on an in-progress order, the parent order will appear here."
        />
      ) : (
        <MechanicActiveOrdersBoard
          orders={filteredOrders}
          lookups={lookups}
          hasActiveFilters={hasActiveFilters(filters)}
        />
      )}
    </div>
  );
}
