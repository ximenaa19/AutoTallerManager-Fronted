import { Link } from 'react-router-dom';
import { Calendar, Car, ClipboardList } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { MechanicDashboardActiveOrderDto } from '@/features/mechanic/types/mechanicDashboard.types';
import { formatMechanicVehicleLabel } from '@/features/mechanic/utils/vehicleLabel';
import { ROUTES } from '@/routes/routePaths';
import { formatDateTime } from '@/utils/format';

export interface MechanicDashboardActiveOrdersPreviewProps {
  orders: MechanicDashboardActiveOrderDto[];
}

export function MechanicDashboardActiveOrdersPreview({
  orders,
}: MechanicDashboardActiveOrdersPreviewProps) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {orders.map((order) => {
        const vehicleLabel = formatMechanicVehicleLabel(
          order.vehicleId,
          order.vehiclePlate,
        );
        const statusName = order.orderStatusName?.trim() || 'In progress';

        return (
          <Card key={order.serviceOrderId} padding="md" className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <ClipboardList className="size-4 text-accent" aria-hidden />
                  <h3 className="text-base font-semibold text-text-primary">
                    Order #{order.serviceOrderId}
                  </h3>
                </div>
                <p className="text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <Car className="size-3.5" aria-hidden />
                    {vehicleLabel}
                  </span>
                </p>
              </div>
              <span className="inline-flex rounded-full bg-info-muted px-2.5 py-1 text-xs font-medium text-info">
                {statusName}
              </span>
            </div>

            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Assigned services
                </dt>
                <dd className="text-text-primary">{order.assignedServicesCount}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Pending work reports
                </dt>
                <dd className="text-text-primary">{order.pendingWorkReportsCount}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Entry date
                </dt>
                <dd className="text-text-primary">{formatDateTime(order.entryDate)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Estimated delivery
                </dt>
                <dd className="text-text-primary">
                  {order.estimatedDeliveryDate
                    ? formatDateTime(order.estimatedDeliveryDate)
                    : 'Not scheduled'}
                </dd>
              </div>
            </dl>

            <Link
              to={ROUTES.MECHANIC_ACTIVE_ORDERS}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              <Calendar className="size-3.5" aria-hidden />
              View active orders
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
