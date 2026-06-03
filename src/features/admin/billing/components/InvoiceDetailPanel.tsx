import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { InvoiceStatusBadge } from '@/features/admin/billing/components/InvoiceStatusBadge';
import type { BillingLookups } from '@/features/admin/billing/hooks/useBillingLookups';
import type { InvoiceDetailLineDto } from '@/features/admin/billing/types/invoiceDetails.types';
import type { InvoiceDto } from '@/features/admin/billing/types/invoices.types';
import { adminServiceOrderDetailPath } from '@/routes/routePaths';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { Link } from 'react-router-dom';

export interface InvoiceDetailPanelProps {
  invoice: InvoiceDto;
  details: InvoiceDetailLineDto[];
  lookups: BillingLookups;
  detailsLoading?: boolean;
  detailsError?: string | null;
  onRetryDetails?: () => void;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </span>
      <span className="text-sm text-text-primary sm:text-right">{value}</span>
    </div>
  );
}

export function InvoiceDetailPanel({
  invoice,
  details,
  lookups,
  detailsLoading = false,
  detailsError = null,
  onRetryDetails,
}: InvoiceDetailPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {invoice.invoiceNumber}
            </h2>
            <p className="text-sm text-text-secondary">
              Invoice #{invoice.invoiceId}
            </p>
          </div>
          <InvoiceStatusBadge
            invoiceStatusId={invoice.invoiceStatusId}
            catalogNameById={lookups.invoiceStatusNameById}
          />
        </div>

        <div className="grid gap-3 border-t border-border pt-4">
          <DetailRow
            label="Service order"
            value={
              <Link
                to={adminServiceOrderDetailPath(invoice.serviceOrderId)}
                className="font-medium text-accent hover:underline"
              >
                Order #{invoice.serviceOrderId}
              </Link>
            }
          />
          <DetailRow label="Date" value={formatDateTime(invoice.invoiceDate)} />
          <DetailRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
          <DetailRow label="Tax" value={formatCurrency(invoice.tax)} />
          <DetailRow
            label="Total"
            value={
              <span className="font-bold">{formatCurrency(invoice.total)}</span>
            }
          />
          {invoice.observations && (
            <DetailRow label="Observations" value={invoice.observations} />
          )}
        </div>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">Line items</h3>

        {detailsLoading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-lg bg-bg-elevated"
              />
            ))}
          </div>
        )}

        {detailsError && (
          <Card className="border-danger/30 bg-danger-muted/20 p-4">
            <p className="text-sm text-danger">{detailsError}</p>
            {onRetryDetails && (
              <button
                type="button"
                className="mt-2 text-sm font-medium text-accent hover:underline"
                onClick={onRetryDetails}
              >
                Retry
              </button>
            )}
          </Card>
        )}

        {!detailsLoading && !detailsError && details.length === 0 && (
          <Card className="p-4">
            <p className="text-sm text-text-secondary">No line items on this invoice.</p>
          </Card>
        )}

        {!detailsLoading && !detailsError && details.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-border bg-bg-elevated">
                <tr>
                  <th className="px-4 py-3 font-semibold text-text-secondary">Concept</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary">Type</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary">Qty</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary">Unit price</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail) => (
                  <tr
                    key={detail.invoiceDetailId}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3 text-text-primary">{detail.concept}</td>
                    <td className="px-4 py-3 capitalize text-text-secondary">
                      {detail.lineType}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{detail.quantity}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {formatCurrency(detail.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-text-primary">
                      {formatCurrency(detail.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
