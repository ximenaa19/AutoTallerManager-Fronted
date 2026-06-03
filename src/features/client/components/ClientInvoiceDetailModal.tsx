import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { ClientInvoiceStatusBadge } from '@/features/client/components/ClientInvoiceStatusBadge';
import { ClientPaymentSummaryPanel } from '@/features/client/components/ClientPaymentSummaryPanel';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type {
  ClientInvoiceDetailDto,
  ClientInvoiceDto,
  ClientInvoicePaymentSummaryDto,
} from '@/features/client/types/clientInvoices.types';

export interface ClientInvoiceDetailModalProps {
  invoice: ClientInvoiceDto | null;
  paymentSummary: ClientInvoicePaymentSummaryDto | null;
  paymentSummaryLoading: boolean;
  paymentSummaryError: string | null;
  invoiceDetails: ClientInvoiceDetailDto[];
  invoiceDetailsLoading: boolean;
  invoiceDetailsError: string | null;
  invoiceDetailsAuthorizationPending: boolean;
  onRetry: () => void;
  onClose: () => void;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="text-text-primary">{value}</dd>
    </div>
  );
}

function ClientInvoiceLinesSection({
  invoiceDetails,
  isLoading,
  error,
  authorizationPending,
  onRetry,
}: {
  invoiceDetails: ClientInvoiceDetailDto[];
  isLoading: boolean;
  error: string | null;
  authorizationPending: boolean;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice lines</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState
            title="Loading invoice lines"
            description="Getting invoice detail lines from backend."
          />
        ) : error ? (
          authorizationPending ? (
            <div className="flex flex-col gap-3 rounded-lg border border-warning/30 bg-warning-muted/30 px-4 py-3 text-sm text-warning sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p>{error}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Retry
              </Button>
            </div>
          ) : (
            <ErrorState
              title="Unable to load invoice lines"
              message={error}
              onRetry={onRetry}
            />
          )
        ) : invoiceDetails.length === 0 ? (
          <EmptyState
            title="No invoice lines"
            description="This invoice does not have detail lines returned by the backend yet."
            className="rounded-lg border border-border bg-bg-elevated py-6"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concept</TableHead>
                <TableHead>Line type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit price</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceDetails.map((line) => (
                <TableRow key={line.invoiceDetailId}>
                  <TableCell className="font-medium">
                    {line.concept || `Invoice line #${line.invoiceDetailId}`}
                  </TableCell>
                  <TableCell>{line.lineType}</TableCell>
                  <TableCell>{line.quantity}</TableCell>
                  <TableCell>{formatCurrency(line.unitPrice)}</TableCell>
                  <TableCell>{formatCurrency(line.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function ClientInvoiceDetailModal({
  invoice,
  paymentSummary,
  paymentSummaryLoading,
  paymentSummaryError,
  invoiceDetails,
  invoiceDetailsLoading,
  invoiceDetailsError,
  invoiceDetailsAuthorizationPending,
  onRetry,
  onClose,
}: ClientInvoiceDetailModalProps) {
  if (!invoice) {
    return null;
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Invoice ${invoice.invoiceNumber}`}
      description="Read-only invoice detail and payment status."
      size="lg"
    >
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Invoice summary</CardTitle>
              <ClientInvoiceStatusBadge invoiceStatusId={invoice.invoiceStatusId} />
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <DetailField label="Invoice ID" value={`#${invoice.invoiceId}`} />
              <DetailField label="Invoice number" value={invoice.invoiceNumber} />
              <DetailField label="Service order ID" value={`#${invoice.serviceOrderId}`} />
              <DetailField label="Invoice date" value={formatDateTime(invoice.invoiceDate)} />
              <DetailField label="Subtotal" value={formatCurrency(invoice.subtotal)} />
              <DetailField label="Tax" value={formatCurrency(invoice.tax)} />
              <DetailField label="Total" value={formatCurrency(invoice.total)} />
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-text-muted">Observations</dt>
                <dd className="text-text-primary">
                  {invoice.observations || 'No observations'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <ClientInvoiceLinesSection
          invoiceDetails={invoiceDetails}
          isLoading={invoiceDetailsLoading}
          error={invoiceDetailsError}
          authorizationPending={invoiceDetailsAuthorizationPending}
          onRetry={onRetry}
        />

        <ClientPaymentSummaryPanel
          paymentSummary={paymentSummary}
          isLoading={paymentSummaryLoading}
          error={paymentSummaryError}
          onRetry={onRetry}
        />
      </div>
    </Modal>
  );
}
