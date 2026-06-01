import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import {
  filterBySearchTerm,
  useClientPagination,
} from '@/features/admin/hooks/useClientPagination';
import { serviceOrdersApi } from '@/features/admin/serviceOrders/api/serviceOrders.api';
import { workshopIntakeApi } from '@/features/admin/serviceOrders/api/workshopIntake.api';
import { CreateServiceOrderForm } from '@/features/admin/serviceOrders/components/CreateServiceOrderForm';
import { ServiceOrderFilters } from '@/features/admin/serviceOrders/components/ServiceOrderFilters';
import { ServiceOrderStatusBadge } from '@/features/admin/serviceOrders/components/ServiceOrderStatusBadge';
import { useWorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import type { ServiceOrderDto } from '@/features/admin/serviceOrders/types/serviceOrders.types';
import { vehiclesApi } from '@/features/admin/vehicles/api/vehicles.api';
import {
  formatVehicleModelLabel,
  formatVehicleTypeLabel,
  useVehicleCatalogLookups,
} from '@/features/admin/vehicles/hooks/useVehicleCatalogLookups';
import type { VehicleDto } from '@/features/admin/vehicles/types/vehicles.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { adminServiceOrderDetailPath } from '@/routes/routePaths';
import { formatDateTime } from '@/utils/format';

function getServiceOrderSearchText(params: {
  order: ServiceOrderDto;
  vehicle?: VehicleDto;
  orderStatusNameById: Map<number, string>;
  vehicleLookups: ReturnType<typeof useVehicleCatalogLookups>['lookups'];
}): string {
  const { order, vehicle, orderStatusNameById, vehicleLookups } = params;
  const statusLabel = orderStatusNameById.get(order.orderStatusId) ?? `Status #${order.orderStatusId}`;
  const entryDate = order.entryDate ? formatDateTime(order.entryDate) : '';

  const vehicleModelLabel = vehicle
    ? formatVehicleModelLabel(vehicle.modelId, vehicleLookups)
    : '';
  const vehicleTypeLabel = vehicle
    ? formatVehicleTypeLabel(vehicle.vehicleTypeId, vehicleLookups)
    : '';

  return [
    String(order.serviceOrderId),
    `#${order.serviceOrderId}`,
    String(order.vehicleId),
    `#${order.vehicleId}`,
    vehicle?.vin,
    vehicleModelLabel,
    vehicleTypeLabel,
    order.generalDescription,
    statusLabel,
    order.entryDate,
    entryDate,
    order.createdAt,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function ServiceOrdersPage() {
  const navigate = useNavigate();
  const { lookups, isLoading: catalogsLoading } = useWorkshopCatalogLookups();
  const { lookups: vehicleLookups } = useVehicleCatalogLookups();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadOrders = useCallback(() => serviceOrdersApi.getAll(), []);
  const loadVehicles = useCallback(() => vehiclesApi.getAll(), []);

  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError,
    retry: retryOrders,
  } = useAsyncRequest(loadOrders, [refreshKey]);

  const { data: vehicles } = useAsyncRequest(loadVehicles, [refreshKey]);

  const vehicleById = useMemo(() => {
    const map = new Map<number, VehicleDto>();
    for (const vehicle of vehicles ?? []) {
      map.set(vehicle.vehicleId, vehicle);
    }
    return map;
  }, [vehicles]);

  const filteredOrders = useMemo(() => {
    let result = orders ?? [];

    if (statusFilter) {
      const statusId = Number(statusFilter);
      result = result.filter((order) => order.orderStatusId === statusId);
    }

    return filterBySearchTerm(result, searchTerm, (order, term) => {
      const vehicle = vehicleById.get(order.vehicleId);
      return getServiceOrderSearchText({
        order,
        vehicle,
        orderStatusNameById: lookups.orderStatusNameById,
        vehicleLookups,
      }).includes(term);
    });
  }, [orders, searchTerm, statusFilter, vehicleById, lookups.orderStatusNameById, vehicleLookups]);

  const pagination = useClientPagination(filteredOrders);

  const handleCreate = async (
    payload: Parameters<typeof workshopIntakeApi.createServiceOrder>[0],
  ) => {
    const response = await workshopIntakeApi.createServiceOrder(payload);
    setSuccessMessage(`Service order #${response.data.serviceOrderId} created.`);
    setCreateOpen(false);
    setRefreshKey((value) => value + 1);
    navigate(adminServiceOrderDetailPath(response.data.serviceOrderId));
  };

  const columns = useMemo(
    () => [
      {
        id: 'serviceOrderId',
        header: 'Order',
        cell: (order: ServiceOrderDto) => (
          <span className="font-medium text-text-primary">#{order.serviceOrderId}</span>
        ),
      },
      {
        id: 'vehicle',
        header: 'Vehicle',
        cell: (order: ServiceOrderDto) => {
          const vehicle = vehicleById.get(order.vehicleId);
          return (
            <div className="flex flex-col">
              <span className="text-sm text-text-primary">#{order.vehicleId}</span>
              {vehicle?.vin && (
                <span className="font-mono text-xs text-text-secondary">{vehicle.vin}</span>
              )}
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: (order: ServiceOrderDto) => (
          <ServiceOrderStatusBadge
            orderStatusId={order.orderStatusId}
            catalogNameById={lookups.orderStatusNameById}
          />
        ),
      },
      {
        id: 'entryDate',
        header: 'Entry',
        cell: (order: ServiceOrderDto) => formatDateTime(order.entryDate),
      },
      {
        id: 'description',
        header: 'Description',
        cell: (order: ServiceOrderDto) => (
          <span className="line-clamp-2 max-w-xs text-sm text-text-secondary">
            {order.generalDescription?.trim() || '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'text-right',
        cell: (order: ServiceOrderDto) => (
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Open order ${order.serviceOrderId}`}
            onClick={() => navigate(adminServiceOrderDetailPath(order.serviceOrderId))}
          >
            <ExternalLink className="size-4" />
          </Button>
        ),
      },
    ],
    [lookups.orderStatusNameById, navigate, vehicleById],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Service Orders"
        description="Workshop service orders — intake, status workflow, mechanic assignment, and line-item execution."
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>
            New service order
          </Button>
        }
      />

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-success/30 bg-success-muted/40 px-4 py-3 text-sm text-success"
        >
          {successMessage}
        </div>
      )}

      <ServiceOrderFilters
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        lookups={lookups}
        resultCount={filteredOrders.length}
      />

      <AdminDataTable
        columns={columns}
        data={pagination.items}
        rowKey={(order) => order.serviceOrderId}
        isLoading={ordersLoading || catalogsLoading}
        error={ordersError}
        onRetry={retryOrders}
        emptyTitle="No service orders yet"
        emptyDescription="Create a workshop intake order to start tracking vehicle services."
        emptyAction={
          <Button leftIcon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>
            New service order
          </Button>
        }
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        onPageChange={pagination.setPage}
      />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New service order"
        description="Workshop intake — vehicle, entry inventory, and initial services."
        size="lg"
      >
        <CreateServiceOrderForm
          lookups={lookups}
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>
    </div>
  );
}
