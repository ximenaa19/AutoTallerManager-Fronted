import { useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { customersApi } from '@/features/admin/customers/api/customers.api';
import {
  formatVehicleModelLabel,
  formatVehicleTypeLabel,
  useVehicleCatalogLookups,
} from '@/features/admin/vehicles/hooks/useVehicleCatalogLookups';
import type { ClientVehicleDto } from '@/features/admin/vehicles/types/vehicles.types';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { adminVehicleDetailPath } from '@/routes/routePaths';
import { formatDateTime } from '@/utils/format';
import { Link } from 'react-router-dom';

export interface CustomerVehiclesPanelProps {
  personId: number;
  refreshKey?: number;
}

export function CustomerVehiclesPanel({ personId, refreshKey = 0 }: CustomerVehiclesPanelProps) {
  const { lookups, isLoading: catalogsLoading } = useVehicleCatalogLookups();

  const loadVehicles = useCallback(
    () => customersApi.getClientVehicles(personId),
    [personId],
  );

  const {
    data: vehicles,
    isLoading,
    error,
    retry,
  } = useAsyncRequest(loadVehicles, [personId, refreshKey]);

  const columns = [
    {
      id: 'vehicleId',
      header: 'Vehicle',
      cell: (vehicle: ClientVehicleDto) => (
        <Link
          to={adminVehicleDetailPath(vehicle.vehicleId)}
          className="font-medium text-accent hover:underline"
        >
          #{vehicle.vehicleId}
        </Link>
      ),
    },
    {
      id: 'vin',
      header: 'VIN',
      cell: (vehicle: ClientVehicleDto) => vehicle.vin || '—',
    },
    {
      id: 'model',
      header: 'Model',
      cell: (vehicle: ClientVehicleDto) =>
        formatVehicleModelLabel(vehicle.modelId, lookups),
    },
    {
      id: 'type',
      header: 'Type',
      cell: (vehicle: ClientVehicleDto) =>
        formatVehicleTypeLabel(vehicle.vehicleTypeId, lookups),
    },
    {
      id: 'year',
      header: 'Year',
      cell: (vehicle: ClientVehicleDto) => vehicle.year,
    },
    {
      id: 'mileage',
      header: 'Mileage',
      cell: (vehicle: ClientVehicleDto) => vehicle.mileage.toLocaleString(),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (vehicle: ClientVehicleDto) => (
        <Badge variant={vehicle.isActive ? 'active' : 'cancelled'} dot>
          {vehicle.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'ownership',
      header: 'Ownership',
      cell: (vehicle: ClientVehicleDto) => (
        <span className="text-sm text-text-secondary">
          Since {formatDateTime(vehicle.ownershipStartDate)}
          {vehicle.ownershipEndDate
            ? ` · Ended ${formatDateTime(vehicle.ownershipEndDate)}`
            : ''}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Linked vehicles</h3>
          <p className="text-sm text-text-secondary">
            Vehicles currently or previously owned by this customer.
          </p>
        </div>
        <p className="text-xs text-text-muted">
          Adding a vehicle via POST /api/clients/&#123;personId&#125;/vehicles is deferred until
          the request body is documented in api-contract.md.
        </p>
      </div>

      <AdminDataTable
        columns={columns}
        data={vehicles ?? []}
        rowKey={(vehicle) => vehicle.vehicleId}
        isLoading={isLoading || catalogsLoading}
        error={error}
        onRetry={retry}
        emptyTitle="No vehicles linked"
        emptyDescription="This customer has no vehicles in the workshop system yet."
      />
    </div>
  );
}

export interface CustomerServiceOrdersPanelProps {
  personId: number;
  refreshKey?: number;
}

export function CustomerServiceOrdersPanel({
  personId,
  refreshKey = 0,
}: CustomerServiceOrdersPanelProps) {
  const loadOrders = useCallback(
    () => customersApi.getClientServiceOrders(personId),
    [personId],
  );

  const {
    data: orders,
    isLoading,
    error,
    retry,
  } = useAsyncRequest(loadOrders, [personId, refreshKey]);

  const columns = [
    {
      id: 'serviceOrderId',
      header: 'Order',
      cell: (order: { serviceOrderId: number }) => (
        <span className="font-medium text-text-primary">#{order.serviceOrderId}</span>
      ),
    },
    {
      id: 'vehicleId',
      header: 'Vehicle',
      cell: (order: { vehicleId: number }) => (
        <Link
          to={adminVehicleDetailPath(order.vehicleId)}
          className="text-accent hover:underline"
        >
          #{order.vehicleId}
        </Link>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (order: { orderStatusId: number }) => (
        <Badge variant="accent">Status #{order.orderStatusId}</Badge>
      ),
    },
    {
      id: 'entryDate',
      header: 'Entry',
      cell: (order: { entryDate: string }) => formatDateTime(order.entryDate),
    },
    {
      id: 'description',
      header: 'Description',
      cell: (order: { generalDescription?: string }) =>
        order.generalDescription ?? '—',
    },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-text-primary">Service orders</h3>
        <p className="text-sm text-text-secondary">
          Read-only summary from GET /api/clients/&#123;personId&#125;/service-orders. Full
          workflow is available in the Service Orders module (Phase 4.4+).
        </p>
      </div>

      <AdminDataTable
        columns={columns}
        data={orders ?? []}
        rowKey={(order) => order.serviceOrderId}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        emptyTitle="No service orders"
        emptyDescription="This customer has no service order history yet."
      />
    </div>
  );
}
