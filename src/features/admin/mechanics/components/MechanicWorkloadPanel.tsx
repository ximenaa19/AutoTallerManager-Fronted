import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { MechanicRosterItem, MechanicWorkloadRow } from '@/features/admin/mechanics/types/mechanics.types';
import type { OrderServiceDto } from '@/features/admin/serviceOrders/types/orderServices.types';
import { adminServiceOrderDetailPath } from '@/routes/routePaths';

export interface MechanicWorkloadPanelProps {
  mechanic: MechanicRosterItem;
  orderServiceById: Map<number, OrderServiceDto>;
  specialtyNameById: Map<number, string>;
}

function buildWorkloadRows(
  mechanic: MechanicRosterItem,
  orderServiceById: Map<number, OrderServiceDto>,
  specialtyNameById: Map<number, string>,
): MechanicWorkloadRow[] {
  return mechanic.assignments
    .map((assignment) => {
      const orderService = orderServiceById.get(assignment.orderServiceId);
      return {
        mechanicAssignmentId: assignment.mechanicAssignmentId,
        orderServiceId: assignment.orderServiceId,
        serviceOrderId: orderService?.serviceOrderId ?? null,
        specialtyId: assignment.specialtyId,
        specialtyName:
          specialtyNameById.get(assignment.specialtyId) ??
          `Specialty #${assignment.specialtyId}`,
      };
    })
    .sort((a, b) => {
      const orderA = a.serviceOrderId ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.serviceOrderId ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.orderServiceId - b.orderServiceId;
    });
}

export function MechanicWorkloadPanel({
  mechanic,
  orderServiceById,
  specialtyNameById,
}: MechanicWorkloadPanelProps) {
  const rows = buildWorkloadRows(mechanic, orderServiceById, specialtyNameById);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-bg-elevated/40 p-4">
        <h3 className="text-sm font-medium text-text-primary">Current assignments</h3>
        <p className="mt-2 text-sm text-text-secondary">
          No active mechanic assignments recorded in GET /api/mechanic-assignments for this
          mechanic.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-text-primary">Current assignments</h3>
        <p className="text-xs text-text-secondary">
          Read-only overview from GET /api/mechanic-assignments and GET /api/order-services.
          Assign or unassign mechanics from service order detail.
        </p>
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border bg-bg-elevated/40">
        {rows.map((row) => (
          <li
            key={row.mechanicAssignmentId}
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-text-primary">
                Order service #{row.orderServiceId}
              </p>
              <p className="text-xs text-text-secondary">
                Assignment #{row.mechanicAssignmentId}
                {row.serviceOrderId ? ` · Service order #${row.serviceOrderId}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{row.specialtyName}</Badge>
              {row.serviceOrderId && (
                <Link to={adminServiceOrderDetailPath(row.serviceOrderId)}>
                  <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="size-4" />}>
                    Open order
                  </Button>
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
