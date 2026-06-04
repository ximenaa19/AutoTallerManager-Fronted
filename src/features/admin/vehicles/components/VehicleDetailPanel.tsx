import { Badge } from '@/components/ui/Badge';
import { TemporaryPlateNotice } from '@/features/admin/vehicles/components/TemporaryPlateNotice';
import type { VehicleDto } from '@/features/admin/vehicles/types/vehicles.types';
import {
  formatVehicleModelLabel,
  formatVehicleTypeLabel,
  type VehicleCatalogLookups,
} from '@/features/admin/vehicles/hooks/useVehicleCatalogLookups';
import { formatDateTime, formatNumber } from '@/utils/format';

export interface VehicleDetailPanelProps {
  vehicle: VehicleDto;
  lookups: VehicleCatalogLookups;
}

export function VehicleDetailPanel({ vehicle, lookups }: VehicleDetailPanelProps) {
  return (
    <div className="space-y-4">
      <TemporaryPlateNotice plate={vehicle.plate} />
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Vehicle ID</dt>
        <dd className="mt-1 text-sm font-medium text-text-primary">#{vehicle.vehicleId}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Plate</dt>
        <dd className="mt-1 font-mono text-sm text-text-primary">{vehicle.plate || '—'}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">VIN</dt>
        <dd className="mt-1 font-mono text-sm text-text-primary">{vehicle.vin || '—'}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Model</dt>
        <dd className="mt-1 text-sm text-text-primary">
          {formatVehicleModelLabel(vehicle.modelId, lookups)}
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Type</dt>
        <dd className="mt-1 text-sm text-text-primary">
          {formatVehicleTypeLabel(vehicle.vehicleTypeId, lookups)}
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Year</dt>
        <dd className="mt-1 text-sm text-text-primary">{vehicle.year}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Color</dt>
        <dd className="mt-1 text-sm text-text-primary">{vehicle.color ?? '—'}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Mileage</dt>
        <dd className="mt-1 text-sm text-text-primary">{formatNumber(vehicle.mileage)}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Status</dt>
        <dd className="mt-1">
          <Badge variant={vehicle.isActive ? 'active' : 'cancelled'} dot>
            {vehicle.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </dd>
      </div>
      {vehicle.createdAt && (
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-secondary">Created</dt>
          <dd className="mt-1 text-sm text-text-primary">
            {formatDateTime(vehicle.createdAt)}
          </dd>
        </div>
      )}
    </dl>
    </div>
  );
}
