import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { ServiceOrderStatusBadge } from '@/features/admin/serviceOrders/components/ServiceOrderStatusBadge';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import type { ServiceOrderFullDetailDto } from '@/features/admin/serviceOrders/types/serviceOrders.types';
import type { VehicleCatalogLookups } from '@/features/admin/vehicles/hooks/useVehicleCatalogLookups';
import {
  formatVehicleModelLabel,
  formatVehicleTypeLabel,
} from '@/features/admin/vehicles/hooks/useVehicleCatalogLookups';
import type { VehicleDto } from '@/features/admin/vehicles/types/vehicles.types';
import { formatDateTime } from '@/utils/format';

export interface ServiceOrderDetailHeaderProps {
  order: ServiceOrderFullDetailDto;
  vehicle?: VehicleDto | null;
  lookups: WorkshopCatalogLookups;
  vehicleLookups: VehicleCatalogLookups;
}

export function ServiceOrderDetailHeader({
  order,
  vehicle,
  lookups,
  vehicleLookups,
}: ServiceOrderDetailHeaderProps) {
  return (
    <div className="space-y-3">
    <AdminPageHeader
      title={`Service Order #${order.serviceOrderId}`}
      description={
        order.generalDescription?.trim() ||
        `Vehicle #${order.vehicleId} · entered ${formatDateTime(order.entryDate)}`
      }
      actions={
        <ServiceOrderStatusBadge
          orderStatusId={order.orderStatusId}
          catalogNameById={lookups.orderStatusNameById}
        />
      }
    />

    {vehicle ? (
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-secondary">
        <span>
          <span className="text-text-muted">Vehicle:</span> #{vehicle.vehicleId} ·{' '}
          {vehicle.vin || 'No VIN'}
        </span>
        <span>
          <span className="text-text-muted">Model:</span>{' '}
          {formatVehicleModelLabel(vehicle.modelId, vehicleLookups)}
        </span>
        <span>
          <span className="text-text-muted">Type:</span>{' '}
          {formatVehicleTypeLabel(vehicle.vehicleTypeId, vehicleLookups)}
        </span>
      </div>
    ) : (
      <p className="text-sm text-text-secondary">Vehicle #{order.vehicleId}</p>
    )}
    </div>
  );
}
