import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Ban,
  Calculator,
  CreditCard,
  Send,
  Trash2,
} from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { invoiceDetailsApi } from '@/features/admin/billing/api/invoiceDetails.api';
import { invoicesApi } from '@/features/admin/billing/api/invoices.api';
import { paymentsApi } from '@/features/admin/billing/api/payments.api';
import { CancelInvoiceModal } from '@/features/admin/billing/components/CancelInvoiceModal';
import { InvoiceDetailPanel } from '@/features/admin/billing/components/InvoiceDetailPanel';
import { IssueInvoiceModal } from '@/features/admin/billing/components/IssueInvoiceModal';
import { PaymentSummaryPanel } from '@/features/admin/billing/components/PaymentSummaryPanel';
import { RecalculateInvoiceModal } from '@/features/admin/billing/components/RecalculateInvoiceModal';
import { RecordPaymentModal } from '@/features/admin/billing/components/RecordPaymentModal';
import { useBillingLookups } from '@/features/admin/billing/hooks/useBillingLookups';
import { INVOICE_STATUS_IDS } from '@/features/admin/billing/types/invoices.types';
import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { ROUTES } from '@/routes/routePaths';
import { formatCurrency } from '@/utils/format';

export function InvoiceDetailPage() {
  const { invoiceId: invoiceIdParam } = useParams<{ invoiceId: string }>();
  const invoiceId = Number(invoiceIdParam);
  const navigate = useNavigate();
  const { lookups, isLoading: catalogsLoading } = useBillingLookups();

  const [refreshKey, setRefreshKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [recalculateOpen, setRecalculateOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadInvoice = useCallback(() => {
    if (!invoiceId || Number.isNaN(invoiceId)) {
      throw new Error('Invalid invoice ID');
    }
    return invoicesApi.getById(invoiceId);
  }, [invoiceId]);

  const loadDetails = useCallback(() => invoiceDetailsApi.getAll(), []);
  const loadSummary = useCallback(() => {
    if (!invoiceId || Number.isNaN(invoiceId)) {
      throw new Error('Invalid invoice ID');
    }
    return paymentsApi.getPaymentSummary(invoiceId);
  }, [invoiceId]);

  const invoiceRequest = useAsyncRequest(loadInvoice, [invoiceId, refreshKey]);
  const detailsRequest = useAsyncRequest(loadDetails, [refreshKey]);
  const summaryRequest = useAsyncRequest(loadSummary, [invoiceId, refreshKey]);

  const invoiceDetails = useMemo(() => {
    if (!invoiceRequest.data) return [];
    return (detailsRequest.data ?? []).filter(
      (detail) => detail.invoiceId === invoiceRequest.data!.invoiceId,
    );
  }, [detailsRequest.data, invoiceRequest.data]);

  const refreshAll = () => setRefreshKey((value) => value + 1);

  const invoice = invoiceRequest.data;
  const isDraft = invoice?.invoiceStatusId === INVOICE_STATUS_IDS.draft;
  const isCancelled = invoice?.invoiceStatusId === INVOICE_STATUS_IDS.cancelled;
  const canRecordPayment =
    invoice &&
    !isCancelled &&
    invoice.invoiceStatusId !== INVOICE_STATUS_IDS.draft &&
    (summaryRequest.data?.pendingAmount ?? invoice.total) > 0;

  const runAction = async (action: () => Promise<void>, success: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await action();
      setSuccessMessage(success);
      refreshAll();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecalculate = () =>
    runAction(async () => {
      if (!invoice) return;
      await invoicesApi.recalculate(invoice.invoiceId);
      setRecalculateOpen(false);
    }, `Invoice ${invoice?.invoiceNumber} recalculated.`);

  const handleIssue = () =>
    runAction(async () => {
      if (!invoice) return;
      await invoicesApi.issue(invoice.invoiceId);
      setIssueOpen(false);
    }, `Invoice ${invoice?.invoiceNumber} issued.`);

  const handleCancel = (reason: string) =>
    runAction(async () => {
      if (!invoice) return;
      await invoicesApi.cancel(invoice.invoiceId, { reason });
      setCancelOpen(false);
    }, `Invoice ${invoice?.invoiceNumber} cancelled.`);

  const handleDelete = () =>
    runAction(async () => {
      if (!invoice) return;
      await invoicesApi.delete(invoice.invoiceId);
      setDeleteOpen(false);
      navigate(ROUTES.ADMIN_INVOICES);
    }, '');

  if (!invoiceId || Number.isNaN(invoiceId)) {
    return (
      <Card className="p-6">
        <p className="text-sm text-danger">Invalid invoice ID.</p>
        <Link to={ROUTES.ADMIN_INVOICES} className="mt-2 inline-block text-sm text-accent">
          Back to invoicing
        </Link>
      </Card>
    );
  }

  if (invoiceRequest.error && !invoiceRequest.isLoading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-danger">{invoiceRequest.error}</p>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" onClick={invoiceRequest.retry}>
            Retry
          </Button>
          <Link to={ROUTES.ADMIN_INVOICES}>
            <Button variant="ghost">Back to invoicing</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6">
        <Link
          to={ROUTES.ADMIN_INVOICES}
          className="inline-flex w-fit items-center gap-2 text-sm text-text-secondary hover:text-accent"
        >
          <ArrowLeft className="size-4" />
          Back to invoicing
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {invoice?.invoiceNumber ?? 'Invoice detail'}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Review line items, payment status, and billing actions.
            </p>
          </div>

          {invoice && (
            <div className="flex flex-wrap gap-2">
              {!isCancelled && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Calculator className="size-4" />}
                    onClick={() => setRecalculateOpen(true)}
                  >
                    Recalculate
                  </Button>
                  {isDraft && (
                    <Button
                      size="sm"
                      leftIcon={<Send className="size-4" />}
                      onClick={() => setIssueOpen(true)}
                    >
                      Issue
                    </Button>
                  )}
                  {canRecordPayment && (
                    <Button
                      size="sm"
                      leftIcon={<CreditCard className="size-4" />}
                      onClick={() => setRecordPaymentOpen(true)}
                    >
                      Record payment
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Ban className="size-4" />}
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {isDraft && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="size-4 text-danger" />}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {successMessage && (
        <div
          className="rounded-lg border border-success/30 bg-success-muted px-4 py-3 text-sm text-success"
          role="status"
        >
          {successMessage}
        </div>
      )}

      {actionError && (
        <div
          className="rounded-lg border border-danger/30 bg-danger-muted px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {actionError}
        </div>
      )}

      {invoice && (
        <>
          <InvoiceDetailPanel
            invoice={invoice}
            details={invoiceDetails}
            lookups={lookups}
            detailsLoading={detailsRequest.isLoading || catalogsLoading}
            detailsError={detailsRequest.error}
            onRetryDetails={detailsRequest.retry}
          />

          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">
              Payment summary
            </h3>
            <PaymentSummaryPanel
              summary={summaryRequest.data}
              lookups={lookups}
              isLoading={summaryRequest.isLoading}
              error={summaryRequest.error}
              onRetry={summaryRequest.retry}
            />
            {summaryRequest.data && summaryRequest.data.pendingAmount > 0 && (
              <p className="mt-2 text-xs text-warning">
                Outstanding balance:{' '}
                {formatCurrency(summaryRequest.data.pendingAmount)}
              </p>
            )}
          </div>
        </>
      )}

      {invoice && (
        <>
          <RecalculateInvoiceModal
            open={recalculateOpen}
            invoiceNumber={invoice.invoiceNumber}
            isLoading={actionLoading}
            onClose={() => setRecalculateOpen(false)}
            onConfirm={handleRecalculate}
          />
          <IssueInvoiceModal
            open={issueOpen}
            invoiceNumber={invoice.invoiceNumber}
            isLoading={actionLoading}
            onClose={() => setIssueOpen(false)}
            onConfirm={handleIssue}
          />
          <CancelInvoiceModal
            open={cancelOpen}
            invoiceNumber={invoice.invoiceNumber}
            isLoading={actionLoading}
            onClose={() => setCancelOpen(false)}
            onConfirm={handleCancel}
          />
          <RecordPaymentModal
            open={recordPaymentOpen}
            invoiceId={invoice.invoiceId}
            invoiceNumber={invoice.invoiceNumber}
            summary={summaryRequest.data}
            lookups={lookups}
            onClose={() => setRecordPaymentOpen(false)}
            onSuccess={(message) => {
              setSuccessMessage(message);
              refreshAll();
            }}
          />
          <ConfirmActionModal
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDelete}
            title="Delete invoice"
            description={`Delete draft invoice ${invoice.invoiceNumber}? This removes the invoice record.`}
            confirmLabel="Delete"
            isLoading={actionLoading}
          />
        </>
      )}
    </div>
  );
}
