import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import {
  ORDER_STATUS_IDS,
  formatOrderStatusLabel,
} from '@/features/admin/serviceOrders/types/serviceOrders.types';

function statusVariant(orderStatusId: number): BadgeVariant {
  switch (orderStatusId) {
    case ORDER_STATUS_IDS.pending:
      return 'pending';
    case ORDER_STATUS_IDS.inProgress:
      return 'accent';
    case ORDER_STATUS_IDS.completed:
      return 'completed';
    case ORDER_STATUS_IDS.cancelled:
      return 'cancelled';
    case ORDER_STATUS_IDS.voided:
      return 'voided';
    default:
      return 'default';
  }
}

export interface ServiceOrderStatusBadgeProps {
  orderStatusId: number;
  catalogNameById?: Map<number, string>;
}

export function ServiceOrderStatusBadge({
  orderStatusId,
  catalogNameById,
}: ServiceOrderStatusBadgeProps) {
  return (
    <Badge variant={statusVariant(orderStatusId)} dot>
      {formatOrderStatusLabel(orderStatusId, catalogNameById)}
    </Badge>
  );
}
