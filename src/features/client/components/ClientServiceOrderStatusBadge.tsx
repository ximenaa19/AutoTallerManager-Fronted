import { Badge, type BadgeVariant } from '@/components/ui/Badge';

function getClientServiceOrderStatusLabel(orderStatusId: number): string {
  switch (orderStatusId) {
    case 1:
      return 'Pending';
    case 2:
      return 'In progress';
    case 3:
      return 'Completed';
    case 4:
      return 'Cancelled';
    case 5:
      return 'Voided';
    default:
      return `Status #${orderStatusId}`;
  }
}

function getOrderStatusVariant(orderStatusId: number): BadgeVariant {
  switch (orderStatusId) {
    case 1:
      return 'pending';
    case 2:
      return 'accent';
    case 3:
      return 'completed';
    case 4:
      return 'cancelled';
    case 5:
      return 'voided';
    default:
      return 'default';
  }
}

export function ClientServiceOrderStatusBadge({
  orderStatusId,
}: {
  orderStatusId: number;
}) {
  return (
    <Badge variant={getOrderStatusVariant(orderStatusId)} dot>
      {getClientServiceOrderStatusLabel(orderStatusId)}
    </Badge>
  );
}

export function ClientApprovalStatusBadge({
  customerApproved,
}: {
  customerApproved?: boolean | null;
}) {
  if (customerApproved === true) {
    return (
      <Badge variant="active" dot>
        Approved
      </Badge>
    );
  }

  if (customerApproved === false) {
    return (
      <Badge variant="cancelled" dot>
        Rejected
      </Badge>
    );
  }

  return (
    <Badge variant="pending" dot>
      Pending approval
    </Badge>
  );
}
