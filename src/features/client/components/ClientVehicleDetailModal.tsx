import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDateTime, formatNumber } from '@/utils/format';
import type { ClientVehicleDto } from '@/features/client/types/clientVehicles.types';

export interface ClientVehicleDetailModalProps {
  vehicle: ClientVehicleDto | null;
  onClose: () => void;
}

export function ClientVehicleDetailModal({
  vehicle,
  onClose,
}: ClientVehicleDetailModalProps) {
  if (!vehicle) {
    return null;
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Vehicle ${vehicle.plate || `#${vehicle.vehicleId}`}`}
      description="Read-only vehicle information registered to your account."
      size="md"
    >
      <div className="space-y-4 text-sm">
        <div className="rounded-lg border border-border bg-bg-elevated p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-semibold text-text-primary">Vehicle information</p>
            <Badge variant={vehicle.isActive ? 'active' : 'cancelled'} dot>
              {vehicle.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-muted">Vehicle ID</dt>
              <dd className="font-medium text-text-primary">#{vehicle.vehicleId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-muted">Plate</dt>
              <dd className="font-medium text-text-primary">{vehicle.plate || 'No plate'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-text-muted">VIN</dt>
              <dd className="break-all font-mono text-text-primary">{vehicle.vin || 'No VIN'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-muted">Year</dt>
              <dd className="text-text-primary">{vehicle.year}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-muted">Color</dt>
              <dd className="text-text-primary">{vehicle.color || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-muted">Mileage</dt>
              <dd className="text-text-primary">{formatNumber(vehicle.mileage)} km</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-muted">Status</dt>
              <dd className="text-text-primary">{vehicle.isActive ? 'Active' : 'Inactive'}</dd>
            </div>
            {vehicle.ownershipStartDate ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-text-muted">
                  Ownership start
                </dt>
                <dd className="text-text-primary">
                  {formatDateTime(vehicle.ownershipStartDate)}
                </dd>
              </div>
            ) : null}
            {vehicle.ownershipEndDate ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-text-muted">
                  Ownership end
                </dt>
                <dd className="text-text-primary">
                  {formatDateTime(vehicle.ownershipEndDate)}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <p className="text-xs text-text-secondary">
          Vehicle management actions are handled by the workshop team. This screen is read-only.
        </p>
      </div>
    </Modal>
  );
}
