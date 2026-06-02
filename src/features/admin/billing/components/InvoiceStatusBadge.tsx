import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import {
  INVOICE_STATUS_IDS,
  formatInvoiceStatusLabel,
} from '@/features/admin/billing/types/invoices.types';

function statusVariant(invoiceStatusId: number): BadgeVariant {
  switch (invoiceStatusId) {
    case INVOICE_STATUS_IDS.draft:
      return 'pending';
    case INVOICE_STATUS_IDS.issued:
      return 'accent';
    case INVOICE_STATUS_IDS.paid:
      return 'paid';
    case INVOICE_STATUS_IDS.cancelled:
      return 'cancelled';
    default:
      return 'default';
  }
}

export interface InvoiceStatusBadgeProps {
  invoiceStatusId: number;
  catalogNameById?: Map<number, string>;
}

export function InvoiceStatusBadge({
  invoiceStatusId,
  catalogNameById,
}: InvoiceStatusBadgeProps) {
  return (
    <Badge variant={statusVariant(invoiceStatusId)} dot>
      {formatInvoiceStatusLabel(invoiceStatusId, catalogNameById)}
    </Badge>
  );
}
