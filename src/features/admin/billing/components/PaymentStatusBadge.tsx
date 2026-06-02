import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import {
  PAYMENT_STATUS_IDS,
  formatPaymentStatusLabel,
} from '@/features/admin/billing/types/payments.types';

function statusVariant(paymentStatusId: number): BadgeVariant {
  switch (paymentStatusId) {
    case PAYMENT_STATUS_IDS.pending:
      return 'pending';
    case PAYMENT_STATUS_IDS.completed:
      return 'paid';
    case PAYMENT_STATUS_IDS.refunded:
      return 'cancelled';
    case PAYMENT_STATUS_IDS.failed:
      return 'low-stock';
    default:
      return 'default';
  }
}

export interface PaymentStatusBadgeProps {
  paymentStatusId: number;
  catalogNameById?: Map<number, string>;
}

export function PaymentStatusBadge({
  paymentStatusId,
  catalogNameById,
}: PaymentStatusBadgeProps) {
  return (
    <Badge variant={statusVariant(paymentStatusId)} dot>
      {formatPaymentStatusLabel(paymentStatusId, catalogNameById)}
    </Badge>
  );
}
