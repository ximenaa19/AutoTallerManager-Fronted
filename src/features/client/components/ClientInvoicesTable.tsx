import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { ClientInvoiceStatusBadge } from '@/features/client/components/ClientInvoiceStatusBadge';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type { ClientInvoiceDto } from '@/features/client/types/clientInvoices.types';

export interface ClientInvoicesTableProps {
  invoices: ClientInvoiceDto[];
  onViewDetails: (invoice: ClientInvoiceDto) => void;
}

export function ClientInvoicesTable({
  invoices,
  onViewDetails,
}: ClientInvoicesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Service order</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Subtotal</TableHead>
          <TableHead>Tax</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="w-36 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoiceId}>
            <TableCell>
              <div className="grid gap-0.5">
                <span className="font-semibold text-text-primary">
                  {invoice.invoiceNumber}
                </span>
                <span className="text-xs text-text-secondary">
                  Invoice #{invoice.invoiceId}
                </span>
              </div>
            </TableCell>
            <TableCell>#{invoice.serviceOrderId}</TableCell>
            <TableCell>{formatDateTime(invoice.invoiceDate)}</TableCell>
            <TableCell>
              <ClientInvoiceStatusBadge invoiceStatusId={invoice.invoiceStatusId} />
            </TableCell>
            <TableCell>{formatCurrency(invoice.subtotal)}</TableCell>
            <TableCell>{formatCurrency(invoice.tax)}</TableCell>
            <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Eye className="size-4" />}
                onClick={() => onViewDetails(invoice)}
              >
                View details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
