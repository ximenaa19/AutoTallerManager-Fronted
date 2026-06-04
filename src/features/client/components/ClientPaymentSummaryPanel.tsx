import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type { ClientInvoicePaymentSummaryDto } from '@/features/client/types/clientInvoices.types';

export interface ClientPaymentSummaryPanelProps {
  paymentSummary: ClientInvoicePaymentSummaryDto | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function ClientPaymentSummaryPanel({
  paymentSummary,
  isLoading,
  error,
  onRetry,
}: ClientPaymentSummaryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment summary</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState
            title="Loading payment summary"
            description="Getting payment status for this invoice."
          />
        ) : error ? (
          <ErrorState
            title="Unable to load payment summary"
            message={error}
            onRetry={onRetry}
          />
        ) : paymentSummary ? (
          <div className="space-y-4 text-sm">
            <div className="grid gap-2 rounded-lg border border-border bg-bg-elevated p-3 sm:grid-cols-2">
              <p>
                Invoice total:{' '}
                <span className="font-medium text-text-primary">
                  {formatCurrency(paymentSummary.invoiceTotal)}
                </span>
              </p>
              <p>
                Completed paid:{' '}
                <span className="font-medium text-text-primary">
                  {formatCurrency(paymentSummary.completedPaidAmount)}
                </span>
              </p>
              <p>
                Refunded:{' '}
                <span className="font-medium text-text-primary">
                  {formatCurrency(paymentSummary.refundedAmount)}
                </span>
              </p>
              <p>
                Pending:{' '}
                <span className="font-medium text-text-primary">
                  {formatCurrency(paymentSummary.pendingAmount)}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-text-primary">Payment history</p>
              {paymentSummary.payments.length === 0 ? (
                <EmptyState
                  title="No payments recorded"
                  description="Payment entries will appear here once registered by the workshop."
                  className="rounded-lg border border-border bg-bg-elevated py-6"
                />
              ) : (
                <div className="space-y-2">
                  {paymentSummary.payments.map((payment) => (
                    <article
                      key={payment.paymentId}
                      className="rounded-md border border-border bg-bg-elevated px-3 py-2"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-text-primary">
                            Payment #{payment.paymentId}
                          </p>
                          <p className="text-text-secondary">
                            {formatDateTime(payment.paymentDate)}
                          </p>
                          {payment.reference ? (
                            <p className="text-text-secondary">Reference: {payment.reference}</p>
                          ) : null}
                          <p className="text-text-secondary">
                            Payment method #{payment.paymentMethodId} / Payment status #
                            {payment.paymentStatusId}
                          </p>
                        </div>
                        <p className="font-semibold text-text-primary">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">No payment summary loaded.</p>
        )}
      </CardContent>
    </Card>
  );
}
