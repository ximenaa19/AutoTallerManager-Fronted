import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, RefreshCw, RotateCcw } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/AdminToolbar';
import { paymentsApi } from '@/features/admin/billing/api/payments.api';
import { PaymentStatusBadge } from '@/features/admin/billing/components/PaymentStatusBadge';
import { RefundPaymentModal } from '@/features/admin/billing/components/RefundPaymentModal';
import {
  formatPaymentMethodLabelFromLookups,
  useBillingLookups,
} from '@/features/admin/billing/hooks/useBillingLookups';
import {
  PAYMENT_STATUS_IDS,
  type PaymentCardDto,
  type PaymentDto,
} from '@/features/admin/billing/types/payments.types';
import {
  filterBySearchTerm,
  useClientPagination,
} from '@/features/admin/hooks/useClientPagination';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { adminInvoiceDetailPath } from '@/routes/routePaths';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { cn } from '@/lib/cn';

type PaymentsTab = 'payments' | 'cards';

function paymentMatchesSearch(
  payment: PaymentDto,
  term: string,
  methodLabel: string,
  statusLabel: string,
): boolean {
  const haystack = [
    String(payment.paymentId),
    `#${payment.paymentId}`,
    String(payment.invoiceId),
    `#${payment.invoiceId}`,
    methodLabel,
    statusLabel,
    payment.reference,
    formatDateTime(payment.paymentDate),
    String(payment.amount),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
}

function cardMatchesSearch(
  card: PaymentCardDto,
  term: string,
  cardTypeLabel: string,
): boolean {
  const haystack = [
    String(card.paymentCardId),
    String(card.paymentId),
    cardTypeLabel,
    card.lastFourDigits,
    card.cardHolder,
    card.authorizationCode,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
}

export function PaymentsPage() {
  const { lookups, isLoading: catalogsLoading, retry: retryLookups } =
    useBillingLookups();

  const [activeTab, setActiveTab] = useState<PaymentsTab>('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingRefund, setPendingRefund] = useState<PaymentDto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadPayments = useCallback(() => paymentsApi.getAll(), []);
  const loadCards = useCallback(() => paymentsApi.getPaymentCards(), []);

  const paymentsRequest = useAsyncRequest(loadPayments, [refreshKey]);
  const cardsRequest = useAsyncRequest(loadCards, [refreshKey]);

  const refreshAll = () => {
    setRefreshKey((value) => value + 1);
    void retryLookups();
  };

  const filteredPayments = useMemo(
    () =>
      filterBySearchTerm(paymentsRequest.data ?? [], searchTerm, (payment, term) =>
        paymentMatchesSearch(
          payment,
          term,
          formatPaymentMethodLabelFromLookups(
            payment.paymentMethodId,
            lookups,
          ),
          lookups.paymentStatusNameById.get(payment.paymentStatusId) ??
            `Status #${payment.paymentStatusId}`,
        ),
      ),
    [paymentsRequest.data, searchTerm, lookups],
  );

  const filteredCards = useMemo(
    () =>
      filterBySearchTerm(cardsRequest.data ?? [], searchTerm, (card, term) =>
        cardMatchesSearch(
          card,
          term,
          lookups.cardTypeNameById.get(card.cardTypeId) ??
            `Type #${card.cardTypeId}`,
        ),
      ),
    [cardsRequest.data, searchTerm, lookups.cardTypeNameById],
  );

  const paymentsPagination = useClientPagination(filteredPayments);
  const cardsPagination = useClientPagination(filteredCards);

  const handleRefund = async () => {
    if (!pendingRefund) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await paymentsApi.refund(pendingRefund.paymentId);
      setSuccessMessage(`Payment #${pendingRefund.paymentId} refunded.`);
      setPendingRefund(null);
      refreshAll();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const tabButtonClass = (tab: PaymentsTab) =>
    cn(
      'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
      activeTab === tab
        ? 'bg-accent-muted text-accent'
        : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
    );

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Payments"
        description="Review recorded payments, card transactions, and process refunds."
        actions={
          <Button
            variant="secondary"
            leftIcon={<RefreshCw className="size-4" />}
            onClick={refreshAll}
          >
            Refresh
          </Button>
        }
      />

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

      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        <button type="button" className={tabButtonClass('payments')} onClick={() => { setActiveTab('payments'); setSearchTerm(''); }}>
          Payments
        </button>
        <button type="button" className={tabButtonClass('cards')} onClick={() => { setActiveTab('cards'); setSearchTerm(''); }}>
          Payment cards
        </button>
      </div>

      {activeTab === 'payments' && (
        <>
          <AdminToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by payment ID, invoice, method, reference…"
            summary={
              <p className="text-xs text-text-muted">
                {filteredPayments.length} payment
                {filteredPayments.length === 1 ? '' : 's'}
              </p>
            }
          />

          <AdminDataTable
            columns={[
              {
                id: 'id',
                header: 'Payment',
                className: 'w-24',
                cell: (row) => `#${row.paymentId}`,
              },
              {
                id: 'invoice',
                header: 'Invoice',
                cell: (row) => (
                  <Link
                    to={adminInvoiceDetailPath(row.invoiceId)}
                    className="font-medium text-accent hover:underline"
                  >
                    #{row.invoiceId}
                  </Link>
                ),
              },
              {
                id: 'date',
                header: 'Date',
                cell: (row) => formatDateTime(row.paymentDate),
              },
              {
                id: 'method',
                header: 'Method',
                cell: (row) =>
                  formatPaymentMethodLabelFromLookups(
                    row.paymentMethodId,
                    lookups,
                  ),
              },
              {
                id: 'status',
                header: 'Status',
                cell: (row) => (
                  <PaymentStatusBadge
                    paymentStatusId={row.paymentStatusId}
                    catalogNameById={lookups.paymentStatusNameById}
                  />
                ),
              },
              {
                id: 'reference',
                header: 'Reference',
                cell: (row) => row.reference ?? '—',
              },
              {
                id: 'amount',
                header: 'Amount',
                cell: (row) => formatCurrency(row.amount),
              },
              {
                id: 'actions',
                header: '',
                className: 'w-24 text-right',
                cell: (row) =>
                  row.paymentStatusId === PAYMENT_STATUS_IDS.completed ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingRefund(row)}
                      aria-label={`Refund payment ${row.paymentId}`}
                    >
                      <RotateCcw className="size-4 text-danger" />
                    </Button>
                  ) : null,
              },
            ]}
            data={paymentsPagination.items}
            rowKey={(row) => row.paymentId}
            isLoading={paymentsRequest.isLoading || catalogsLoading}
            error={paymentsRequest.error}
            onRetry={paymentsRequest.retry}
            emptyTitle="No payments recorded"
            emptyDescription="Payments appear here after recording them from an issued invoice."
            page={paymentsPagination.page}
            totalPages={paymentsPagination.totalPages}
            totalCount={paymentsPagination.totalCount}
            onPageChange={paymentsPagination.setPage}
          />
        </>
      )}

      {activeTab === 'cards' && (
        <>
          <AdminToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by cardholder, last four digits, payment ID…"
            summary={
              <p className="text-xs text-text-muted">
                {filteredCards.length} card record
                {filteredCards.length === 1 ? '' : 's'}
              </p>
            }
          />

          <AdminDataTable
            columns={[
              {
                id: 'payment',
                header: 'Payment',
                cell: (row) => `#${row.paymentId}`,
              },
              {
                id: 'type',
                header: 'Card type',
                cell: (row) =>
                  lookups.cardTypeNameById.get(row.cardTypeId) ??
                  `Type #${row.cardTypeId}`,
              },
              {
                id: 'lastFour',
                header: 'Last four',
                cell: (row) => (
                  <span className="font-mono">•••• {row.lastFourDigits}</span>
                ),
              },
              {
                id: 'holder',
                header: 'Cardholder',
                cell: (row) => row.cardHolder,
              },
              {
                id: 'auth',
                header: 'Auth code',
                cell: (row) => row.authorizationCode ?? '—',
              },
            ]}
            data={cardsPagination.items}
            rowKey={(row) => row.paymentCardId}
            isLoading={cardsRequest.isLoading}
            error={cardsRequest.error}
            onRetry={cardsRequest.retry}
            emptyTitle="No card payments"
            emptyDescription="Card details are stored when recording card-method payments."
            emptyAction={
              <CreditCard className="mx-auto size-8 text-text-muted" aria-hidden />
            }
            page={cardsPagination.page}
            totalPages={cardsPagination.totalPages}
            totalCount={cardsPagination.totalCount}
            onPageChange={cardsPagination.setPage}
          />
        </>
      )}

      {pendingRefund && (
        <RefundPaymentModal
          open={pendingRefund !== null}
          paymentId={pendingRefund.paymentId}
          amount={pendingRefund.amount}
          isLoading={actionLoading}
          onClose={() => setPendingRefund(null)}
          onConfirm={handleRefund}
        />
      )}
    </div>
  );
}
