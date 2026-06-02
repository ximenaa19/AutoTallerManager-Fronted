import { Card } from '@/components/ui/Card';
import { PaymentStatusBadge } from '@/features/admin/billing/components/PaymentStatusBadge';
import type { BillingLookups } from '@/features/admin/billing/hooks/useBillingLookups';
import { formatPaymentMethodLabelFromLookups } from '@/features/admin/billing/hooks/useBillingLookups';
import type { PaymentSummaryDto } from '@/features/admin/billing/types/payments.types';
import { formatCurrency, formatDateTime } from '@/utils/format';

export interface PaymentSummaryPanelProps {
  summary?: PaymentSummaryDto | null;
  lookups: BillingLookups;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function SummaryMetric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'success' | 'warning' | 'default';
}) {
  const valueClass =
    accent === 'success'
      ? 'text-success'
      : accent === 'warning'
        ? 'text-warning'
        : 'text-text-primary';

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-bg-elevated px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </span>
      <span className={`text-lg font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}

export function PaymentSummaryPanel({
  summary,
  lookups,
  isLoading = false,
  error = null,
  onRetry,
}: PaymentSummaryPanelProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-lg bg-bg-elevated"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger/30 bg-danger-muted/20 p-4">
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
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="p-4">
        <p className="text-sm text-text-secondary">No payment summary available.</p>
      </Card>
    );
  }

  const pendingAccent =
    summary.pendingAmount > 0 ? ('warning' as const) : ('success' as const);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryMetric
          label="Invoice total"
          value={formatCurrency(summary.invoiceTotal)}
        />
        <SummaryMetric
          label="Paid (completed)"
          value={formatCurrency(summary.completedPaidAmount)}
          accent="success"
        />
        <SummaryMetric
          label="Pending"
          value={formatCurrency(summary.pendingAmount)}
          accent={pendingAccent}
        />
        <SummaryMetric
          label="Refunded"
          value={formatCurrency(summary.refundedAmount)}
        />
      </div>

      {summary.payments.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-border bg-bg-elevated">
              <tr>
                <th className="px-4 py-3 font-semibold text-text-secondary">Date</th>
                <th className="px-4 py-3 font-semibold text-text-secondary">Method</th>
                <th className="px-4 py-3 font-semibold text-text-secondary">Status</th>
                <th className="px-4 py-3 font-semibold text-text-secondary">Reference</th>
                <th className="px-4 py-3 text-right font-semibold text-text-secondary">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.payments.map((payment) => (
                <tr
                  key={payment.paymentId}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3 text-text-primary">
                    {formatDateTime(payment.paymentDate)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatPaymentMethodLabelFromLookups(
                      payment.paymentMethodId,
                      lookups,
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge
                      paymentStatusId={payment.paymentStatusId}
                      catalogNameById={lookups.paymentStatusNameById}
                    />
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {payment.reference ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-text-primary">
                    {formatCurrency(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
