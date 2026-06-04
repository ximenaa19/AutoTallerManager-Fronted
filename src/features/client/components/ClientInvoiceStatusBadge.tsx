import { Badge, type BadgeVariant } from '@/components/ui/Badge';

function getInvoiceStatusLabel(invoiceStatusId: number): string {
  switch (invoiceStatusId) {
    case 1:
      return 'Draft';
    case 2:
      return 'Issued';
    case 3:
      return 'Paid';
    case 4:
      return 'Cancelled';
    default:
      return `Status #${invoiceStatusId}`;
  }
}

function getInvoiceStatusVariant(invoiceStatusId: number): BadgeVariant {
  switch (invoiceStatusId) {
    case 1:
      return 'pending';
    case 2:
      return 'accent';
    case 3:
      return 'paid';
    case 4:
      return 'cancelled';
    default:
      return 'default';
  }
}

export function ClientInvoiceStatusBadge({
  invoiceStatusId,
}: {
  invoiceStatusId: number;
}) {
  return (
    <Badge variant={getInvoiceStatusVariant(invoiceStatusId)} dot>
      {getInvoiceStatusLabel(invoiceStatusId)}
    </Badge>
  );
}
