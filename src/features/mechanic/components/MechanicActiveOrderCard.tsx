import { Link } from 'react-router-dom';
import { Calendar, Car, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';import type { MechanicActiveOrderDto } from '@/features/mechanic/types/mechanicActiveOrders.types';
import {
  formatCustomerLabel,
  resolveOrderStatusName,
} from '@/features/mechanic/utils/mechanicEnrichedLabels';
import { formatMechanicVehicleLabel } from '@/features/mechanic/utils/vehicleLabel';
import { ROUTES } from '@/routes/routePaths';
import { formatDateTime } from '@/utils/format';

export interface MechanicActiveOrderCardProps {
  order: MechanicActiveOrderDto;
  lookups: WorkshopCatalogLookups;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </dt>
      <dd className="text-sm text-text-primary">{value}</dd>
    </div>
  );
}

export function MechanicActiveOrderCard({
  order,
  lookups,
}: MechanicActiveOrderCardProps) {
  const vehicleLabel = formatMechanicVehicleLabel(order.vehicleId, order.vehiclePlate);
  const orderStatusName = resolveOrderStatusName(
    order.orderStatusId,
    order.orderStatusName,
    lookups,
  );
  const customerLabel = formatCustomerLabel(
    order.customerName,
    order.customerDocumentNumber,
  );

  return (
    <Card padding="md" className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <ClipboardList className="size-4 text-accent" aria-hidden />
            <h3 className="text-base font-semibold text-text-primary">
              Service order #{order.serviceOrderId}
            </h3>
          </div>
          <p className="text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Car className="size-3.5" aria-hidden />
              {vehicleLabel}
            </span>
          </p>
        </div>
        <Badge variant="accent" dot>
          {orderStatusName}
        </Badge>      </div>

      {order.generalDescription?.trim() && (
        <p className="text-sm leading-relaxed text-text-secondary">
          {order.generalDescription}
        </p>
      )}

      <dl className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Entry date" value={formatDateTime(order.entryDate)} />
        <DetailItem
          label="Estimated delivery"
          value={
            order.estimatedDeliveryDate
              ? formatDateTime(order.estimatedDeliveryDate)
              : 'Not scheduled'
          }
        />
        <DetailItem label="Vehicle" value={vehicleLabel} />
        <DetailItem label="Order status" value={orderStatusName} />
        <DetailItem
          label="Your assigned services"
          value={String(order.assignedServicesCount)}
        />
        <DetailItem
          label="Pending work reports"
          value={String(order.pendingWorkReportsCount)}
        />
        {customerLabel && <DetailItem label="Customer" value={customerLabel} />}      </dl>

      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" aria-hidden />
            Entered {formatDateTime(order.entryDate)}
          </span>
        </div>

        <Link
          to={ROUTES.MECHANIC_ASSIGNED_SERVICES}
          className="text-sm font-medium text-accent hover:underline"
        >
          Find assigned services for this order
        </Link>
      </div>
    </Card>
  );
}
