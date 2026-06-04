import { Receipt, RefreshCw } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ClientInvoiceDetailModal } from '@/features/client/components/ClientInvoiceDetailModal';
import { ClientInvoicesTable } from '@/features/client/components/ClientInvoicesTable';
import { useClientInvoices } from '@/features/client/hooks/useClientInvoices';

export function ClientInvoicesPage() {
  const invoices = useClientInvoices();

  if (invoices.isLoading) {
    return (
      <LoadingState
        title="Loading invoices"
        description="Getting invoices linked to your client account."
        className="min-h-[420px]"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <DashboardHeader
          title="My Invoices"
          subtitle="Review your invoices and payment status."
        />
        <Button
          variant="secondary"
          leftIcon={<RefreshCw className="size-4" />}
          onClick={() => {
            void invoices.retry();
          }}
          disabled={invoices.paymentSummaryLoading || invoices.invoiceDetailsLoading}
        >
          Refresh
        </Button>
      </div>

      {invoices.error ? (
        <ErrorState
          title="Unable to load invoices"
          message={invoices.error}
          onRetry={invoices.retry}
        />
      ) : invoices.invoices.length === 0 ? (
        <EmptyState
          title="You do not have invoices yet."
          description="Invoices linked to your service orders will appear here once issued by the workshop."
          icon={<Receipt className="size-6" />}
          className="rounded-lg border border-border bg-bg-surface"
        />
      ) : (
        <Card padding="none">
          <CardContent>
            <ClientInvoicesTable
              invoices={invoices.invoices}
              onViewDetails={invoices.openInvoiceDetail}
            />
          </CardContent>
        </Card>
      )}

      <ClientInvoiceDetailModal
        invoice={invoices.selectedInvoice}
        paymentSummary={invoices.paymentSummary}
        paymentSummaryLoading={invoices.paymentSummaryLoading}
        paymentSummaryError={invoices.paymentSummaryError}
        invoiceDetails={invoices.invoiceDetails}
        invoiceDetailsLoading={invoices.invoiceDetailsLoading}
        invoiceDetailsError={invoices.invoiceDetailsError}
        invoiceDetailsAuthorizationPending={invoices.invoiceDetailsAuthorizationPending}
        onRetry={invoices.retryInvoiceDetail}
        onClose={invoices.closeInvoiceDetail}
      />
    </div>
  );
}
