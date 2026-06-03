import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type {
  AdminMechanicActiveOrderDto,
  AdminMechanicWorkloadDto,
  AdminMechanicWorkloadServiceDto,
} from '@/features/admin/mechanics/types/adminMechanics.types';
import { adminServiceOrderDetailPath } from '@/routes/routePaths';
import { formatDateTime } from '@/utils/format';

export interface MechanicWorkloadPanelProps {
  workload: AdminMechanicWorkloadDto | null;
  activeOrders?: AdminMechanicActiveOrderDto[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function ServiceRow({ service }: { service: AdminMechanicWorkloadServiceDto }) {
  const plate = service.vehiclePlate?.trim();
  const title = plate
    ? plate
    : service.serviceTypeName?.trim() || `Order service #${service.orderServiceId}`;

  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary">
          Service order #{service.serviceOrderId}
          {service.serviceTypeName ? ` · ${service.serviceTypeName}` : ''}
          {service.orderStatusName ? ` · ${service.orderStatusName}` : ''}
        </p>
        {service.customerName && (
          <p className="text-xs text-text-muted">{service.customerName}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {service.workReported ? (
          <Badge variant="active">Work reported</Badge>
        ) : (
          <Badge variant="pending">Pending work</Badge>
        )}
        <Link to={adminServiceOrderDetailPath(service.serviceOrderId)}>
          <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="size-4" />}>
            Open order
          </Button>
        </Link>
      </div>
    </li>
  );
}

export function MechanicWorkloadPanel({
  workload,
  activeOrders = [],
  isLoading = false,
  error = null,
  onRetry,
}: MechanicWorkloadPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-bg-elevated/40 p-4">
        <p className="text-sm text-text-secondary">Loading workload…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger-muted/20 p-4">
        <p className="text-sm text-danger">{error}</p>
        {onRetry && (
          <button
            type="button"
            className="mt-2 text-sm font-medium text-accent hover:underline"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!workload) {
    return null;
  }

  const services = workload.services ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: 'Assigned', value: workload.assignedServicesCount },
          { label: 'Active orders', value: workload.activeOrdersCount },
          { label: 'Pending', value: workload.pendingServicesCount },
          { label: 'In progress', value: workload.inProgressServicesCount },
          { label: 'Completed', value: workload.completedServicesCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-bg-elevated/40 px-3 py-2"
          >
            <p className="text-xs text-text-secondary">{stat.label}</p>
            <p className="text-lg font-semibold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-medium text-text-primary">Assigned services</h3>
        <p className="text-xs text-text-secondary">
          From GET /api/admin/mechanics/{'{personId}'}/workload
        </p>
        {services.length === 0 ? (
          <p className="mt-2 text-sm text-text-secondary">No assigned services.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-bg-elevated/40">
            {services.map((service) => (
              <ServiceRow key={service.mechanicAssignmentId} service={service} />
            ))}
          </ul>
        )}
      </div>

      {activeOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-primary">Active orders</h3>
          <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-bg-elevated/40">
            {activeOrders.map((order) => (
              <li
                key={order.serviceOrderId}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {order.vehiclePlate?.trim() || `Order #${order.serviceOrderId}`}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {order.orderStatusName} · entered {formatDateTime(order.entryDate)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {order.assignedServicesCount} assigned ·{' '}
                    {order.pendingWorkReportsCount} pending work reports
                  </p>
                </div>
                <Link to={adminServiceOrderDetailPath(order.serviceOrderId)}>
                  <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="size-4" />}>
                    Open order
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
