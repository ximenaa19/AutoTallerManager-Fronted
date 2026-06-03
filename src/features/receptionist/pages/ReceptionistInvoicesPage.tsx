import { useCallback, useMemo, useState } from 'react';
import { Calculator, Eye, RefreshCw, Search, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { ReceptionistPageHeader } from '@/features/receptionist/components/ReceptionistPageHeader';
import { getErrorMessage } from '@/api/apiError';
import { receptionistInvoicesApi } from '@/features/receptionist/api/receptionistInvoices.api';
import { receptionistClientsApi } from '@/features/receptionist/api/receptionistClients.api';
import { useReceptionistInvoiceLookups } from '@/features/receptionist/hooks/useReceptionistInvoiceLookups';
import { useReceptionistInvoiceSearch } from '@/features/receptionist/hooks/useReceptionistInvoiceSearch';
import { useReceptionistClientSearch } from '@/features/receptionist/hooks/useReceptionistClientSearch';
import { useWorkshopCatalogs } from '@/features/receptionist/hooks/useWorkshopCatalogs';
import { receptionistServiceOrdersApi } from '@/features/receptionist/api/receptionistServiceOrders.api';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type {
  ClientSearchResultDto,
  ClientServiceOrderSummaryDto,
} from '@/features/receptionist/types/receptionistClients.types';
import type {
  InvoiceDto,
  InvoicePaymentSummaryDto,
} from '@/features/receptionist/types/receptionistInvoices.types';
import { RECEPTIONIST_INVOICE_STATUS_IDS } from '@/features/receptionist/types/receptionistInvoices.types';
import type {
  ServiceOrderFullDetailDto,
  ServiceOrderFullPartSummaryDto,
  ServiceOrderFullServiceSummaryDto,
} from '@/features/receptionist/types/receptionistServiceOrders.types';

function formatInvoiceStatusLabel(
  invoiceStatusId: number,
  invoiceStatusNameById: Map<number, string>,
): string {
  const mappedStatus = invoiceStatusNameById.get(invoiceStatusId);
  if (mappedStatus) {
    return mappedStatus;
  }

  switch (invoiceStatusId) {
    case RECEPTIONIST_INVOICE_STATUS_IDS.draft:
      return 'Draft';
    case RECEPTIONIST_INVOICE_STATUS_IDS.issued:
      return 'Issued';
    case RECEPTIONIST_INVOICE_STATUS_IDS.paid:
      return 'Paid';
    case RECEPTIONIST_INVOICE_STATUS_IDS.cancelled:
      return 'Cancelled';
    default:
      return `Status #${invoiceStatusId}`;
  }
}

function invoiceStatusVariant(
  invoiceStatusId: number,
): 'pending' | 'accent' | 'paid' | 'cancelled' | 'default' {
  if (invoiceStatusId === RECEPTIONIST_INVOICE_STATUS_IDS.draft) {
    return 'pending';
  }
  if (invoiceStatusId === RECEPTIONIST_INVOICE_STATUS_IDS.issued) {
    return 'accent';
  }
  if (invoiceStatusId === RECEPTIONIST_INVOICE_STATUS_IDS.paid) {
    return 'paid';
  }
  if (invoiceStatusId === RECEPTIONIST_INVOICE_STATUS_IDS.cancelled) {
    return 'cancelled';
  }

  return 'default';
}

function parseTaxRateValue(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return null;
  }

  return parsed;
}

function getApprovedServices(
  serviceOrderDetail: ServiceOrderFullDetailDto | null,
): ServiceOrderFullServiceSummaryDto[] {
  return serviceOrderDetail?.services.filter((service) => service.customerApproved === true) ?? [];
}

function getApprovedParts(
  serviceOrderDetail: ServiceOrderFullDetailDto | null,
): ServiceOrderFullPartSummaryDto[] {
  return (
    serviceOrderDetail?.services.flatMap(
      (service) => service.parts?.filter((part) => part.customerApproved === true) ?? [],
    ) ?? []
  );
}

function getApprovedServicesSubtotal(serviceOrderDetail: ServiceOrderFullDetailDto | null): number {
  return getApprovedServices(serviceOrderDetail).reduce(
    (total, service) => total + service.laborCost,
    0,
  );
}

function getApprovedPartsSubtotal(serviceOrderDetail: ServiceOrderFullDetailDto | null): number {
  return getApprovedParts(serviceOrderDetail).reduce(
    (total, part) => total + part.subtotal,
    0,
  );
}

function getEstimatedSubtotal(serviceOrderDetail: ServiceOrderFullDetailDto | null): number {
  return (
    getApprovedServicesSubtotal(serviceOrderDetail) +
    getApprovedPartsSubtotal(serviceOrderDetail)
  );
}

type ServiceOrderSummaryCardProps = {
  invoiceRows: Array<{
    invoiceId: number;
    invoiceNumber: string;
    serviceOrderId: number;
    invoiceStatusId: number;
    invoiceDate: string;
    total: number;
  }>;
  statusNameById: Map<number, string>;
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  searchTerm: string;
  onRetry?: () => void;
  onView: (invoiceId: number) => void;
};

function InvoicesTable({
  invoiceRows,
  statusNameById,
  isLoading,
  error,
  hasSearched,
  searchTerm,
  onRetry,
  onView,
}: ServiceOrderSummaryCardProps) {
  if (isLoading) {
    return (
      <LoadingState
        title="Searching invoices"
        description="Using invoice search and local listing data."
      />
    );
  }

  if (error) {
    return <ErrorState title="Unable to load invoices" message={error} onRetry={onRetry} />;
  }

  if (hasSearched && invoiceRows.length === 0) {
    return (
      <EmptyState
        title={`No invoices for "${searchTerm}"`}
        description="Try another search term."
      />
    );
  }

  if (!hasSearched && invoiceRows.length === 0) {
    return (
      <EmptyState
        title="No invoices yet"
        description="Generate an invoice from a completed service order."
        icon={<Search className="size-6" />}
      />
    );
  }

  if (!hasSearched && !error && invoiceRows.length === 0) {
    return (
      <EmptyState
        title="No invoices found"
        description="No invoices are available right now."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hasSearched ? 'Search results' : 'Invoices'}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Service order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoiceRows.map((invoice) => (
              <TableRow key={invoice.invoiceId}>
                <TableCell className="font-medium text-text-primary">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>#{invoice.serviceOrderId}</TableCell>
                <TableCell>{formatDateTime(invoice.invoiceDate)}</TableCell>
                <TableCell>
                  <Badge variant={invoiceStatusVariant(invoice.invoiceStatusId)} dot>
                    {formatInvoiceStatusLabel(invoice.invoiceStatusId, statusNameById)}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(invoice.total)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye className="size-4" />}
                    onClick={() => onView(invoice.invoiceId)}
                    aria-label={`View invoice ${invoice.invoiceNumber}`}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

type ClientSelectionListProps = {
  rows: ClientSearchResultDto[];
  selectedClientId: number | null;
  onSelect: (client: ClientSearchResultDto) => void;
};

function ClientSelectionList({
  rows,
  selectedClientId,
  onSelect,
}: ClientSelectionListProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {rows.map((client) => {
        const isSelected = client.personId === selectedClientId;

        return (
          <div
            key={client.personId}
            className="flex items-start justify-between gap-3 rounded-md border border-border bg-bg-surface px-3 py-2"
          >
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-text-primary">{client.fullName}</p>
              <p className="text-xs text-text-secondary">
                Document {client.documentNumber}
              </p>
              <p className="text-xs text-text-secondary">
                {[client.primaryEmail, client.primaryPhoneNumber].filter(Boolean).join(' / ') ||
                  'No contact data'}
              </p>
            </div>
            <Button
              size="sm"
              variant={isSelected ? 'secondary' : 'ghost'}
              onClick={() => onSelect(client)}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

type ClientServiceOrderSelectionListProps = {
  rows: ClientServiceOrderSummaryDto[];
  selectedServiceOrderId: number | null;
  onSelect: (serviceOrderId: number) => void;
  orderStatusNameById: Map<number, string>;
};

function ClientServiceOrderSelectionList({
  rows,
  selectedServiceOrderId,
  onSelect,
  orderStatusNameById,
}: ClientServiceOrderSelectionListProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No service orders for this customer"
        description="Select another customer or create a service order first."
        className="bg-bg-elevated py-6"
      />
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((order) => {
        const isSelected = order.serviceOrderId === selectedServiceOrderId;

        return (
          <div
            key={order.serviceOrderId}
            className="flex items-start justify-between gap-2 rounded-md border border-border bg-bg-surface px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-text-primary">
                Order #{order.serviceOrderId}
              </p>
              <p className="text-xs text-text-secondary">
                Vehicle #{order.vehicleId} /{' '}
                {orderStatusNameById.get(order.orderStatusId) ?? `Status #${order.orderStatusId}`}
              </p>
              <p className="text-xs text-text-secondary">
                Entry {formatDateTime(order.entryDate)}
              </p>
              <p className="text-xs text-text-secondary">
                {order.generalDescription || 'No description'}
              </p>
            </div>
            <Button
              size="sm"
              variant={isSelected ? 'secondary' : 'ghost'}
              onClick={() => onSelect(order.serviceOrderId)}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export function ReceptionistInvoicesPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDto | null>(null);
  const [invoiceDetailLoading, setInvoiceDetailLoading] = useState(false);
  const [invoiceDetailError, setInvoiceDetailError] = useState<string | null>(null);

  const [paymentSummary, setPaymentSummary] = useState<InvoicePaymentSummaryDto | null>(null);
  const [paymentSummaryLoading, setPaymentSummaryLoading] = useState(false);
  const [paymentSummaryError, setPaymentSummaryError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientSearchResultDto | null>(null);
  const [clientServiceOrders, setClientServiceOrders] = useState<ClientServiceOrderSummaryDto[]>([]);
  const [clientServiceOrdersLoading, setClientServiceOrdersLoading] = useState(false);
  const [clientServiceOrdersError, setClientServiceOrdersError] = useState<string | null>(null);
  const [serviceOrderToGenerate, setServiceOrderToGenerate] = useState<number | null>(null);
  const [serviceOrderDetail, setServiceOrderDetail] = useState<ServiceOrderFullDetailDto | null>(null);
  const [serviceOrderDetailLoading, setServiceOrderDetailLoading] = useState(false);
  const [serviceOrderDetailError, setServiceOrderDetailError] = useState<string | null>(null);
  const [generateTaxRate, setGenerateTaxRate] = useState('19');
  const [generateObservations, setGenerateObservations] = useState('');
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateLoading, setGenerateLoading] = useState(false);

  const invoiceSearch = useReceptionistInvoiceSearch({ minTermLength: 2 });
  const clientSearch = useReceptionistClientSearch({ minTermLength: 2 });
  const invoiceLookups = useReceptionistInvoiceLookups();
  const workshopCatalogs = useWorkshopCatalogs();

  const invoiceRequest = useAsyncRequest(() => receptionistInvoicesApi.getAll(), [refreshToken]);

  const invoiceRows = useMemo(
    () =>
      invoiceSearch.term.length >= invoiceSearch.minTermLength
        ? invoiceSearch.results
        : invoiceRequest.data ?? [],
    [
      invoiceRequest.data,
      invoiceSearch.minTermLength,
      invoiceSearch.results,
      invoiceSearch.term,
    ],
  );

  const isSearchingInvoices = invoiceSearch.term.length >= invoiceSearch.minTermLength;
  const approvedServices = useMemo(
    () => getApprovedServices(serviceOrderDetail),
    [serviceOrderDetail],
  );
  const approvedParts = useMemo(
    () => getApprovedParts(serviceOrderDetail),
    [serviceOrderDetail],
  );
  const taxRateValue = parseTaxRateValue(generateTaxRate);
  const estimatedSubtotal = getEstimatedSubtotal(serviceOrderDetail);
  const estimatedTaxAmount =
    taxRateValue === null ? null : (estimatedSubtotal * taxRateValue) / 100;
  const estimatedTotal =
    estimatedTaxAmount === null ? null : estimatedSubtotal + estimatedTaxAmount;
  const hasBillableItems = estimatedSubtotal > 0;

  const refreshInvoices = useCallback(() => {
    setRefreshToken((value) => value + 1);
    void invoiceLookups.retry();
  }, [invoiceLookups]);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedInvoiceId(null);
    setInvoiceDetail(null);
    setInvoiceDetailError(null);
    setPaymentSummary(null);
    setPaymentSummaryError(null);
  }, []);

  const loadInvoiceDetail = useCallback(async (invoiceId: number) => {
    setInvoiceDetailLoading(true);
    setPaymentSummaryLoading(true);
    setInvoiceDetailError(null);
    setPaymentSummaryError(null);

    try {
      const invoiceResponse = await receptionistInvoicesApi.getById(invoiceId);
      setInvoiceDetail(invoiceResponse.data);
    } catch (error) {
      setInvoiceDetailError(getErrorMessage(error));
      setInvoiceDetail(null);
    } finally {
      setInvoiceDetailLoading(false);
    }

    try {
      const summaryResponse = await receptionistInvoicesApi.getPaymentSummary(invoiceId);
      setPaymentSummary(summaryResponse.data);
    } catch (error) {
      setPaymentSummaryError(getErrorMessage(error));
      setPaymentSummary(null);
    } finally {
      setPaymentSummaryLoading(false);
    }
  }, []);

  const openInvoiceDetail = useCallback(
    (invoiceId: number) => {
      setSelectedInvoiceId(invoiceId);
      setDetailOpen(true);
      void loadInvoiceDetail(invoiceId);
    },
    [loadInvoiceDetail],
  );

  const runInvoiceAction = useCallback(
    async (actionLabel: string, action: () => Promise<unknown>) => {
      if (!invoiceDetail) {
        return;
      }

      setActionLoading(true);
      try {
        await action();
        setSuccessMessage(`Invoice ${invoiceDetail.invoiceNumber} ${actionLabel}.`);
        await loadInvoiceDetail(invoiceDetail.invoiceId);
        refreshInvoices();
      } catch (error) {
        setInvoiceDetailError(getErrorMessage(error));
      } finally {
        setActionLoading(false);
      }
    },
    [invoiceDetail, loadInvoiceDetail, refreshInvoices],
  );

  const recalculateInvoice = useCallback(() => {
    if (!invoiceDetail) {
      return;
    }
    void runInvoiceAction('recalculated', () =>
      receptionistInvoicesApi.recalculate(invoiceDetail.invoiceId),
    );
  }, [invoiceDetail, runInvoiceAction]);

  const issueInvoice = useCallback(() => {
    if (!invoiceDetail) {
      return;
    }
    void runInvoiceAction('issued', () =>
      receptionistInvoicesApi.issue(invoiceDetail.invoiceId),
    );
  }, [invoiceDetail, runInvoiceAction]);

  const closeGenerateModal = useCallback(() => {
    setGenerateOpen(false);
    setSelectedClient(null);
    setClientServiceOrders([]);
    setClientServiceOrdersError(null);
    setClientServiceOrdersLoading(false);
    setServiceOrderToGenerate(null);
    clientSearch.setTerm('');
    setServiceOrderDetail(null);
    setServiceOrderDetailError(null);
    setServiceOrderDetailLoading(false);
    setGenerateTaxRate('19');
    setGenerateObservations('');
    setGenerateError(null);
  }, [clientSearch]);

  const openGenerateModal = useCallback(() => {
    setGenerateOpen(true);
    setGenerateError(null);
    clientSearch.setTerm('');
    setSelectedClient(null);
    setClientServiceOrders([]);
    setClientServiceOrdersError(null);
    setClientServiceOrdersLoading(false);
    setServiceOrderToGenerate(null);
    setServiceOrderDetail(null);
    setServiceOrderDetailError(null);
    setServiceOrderDetailLoading(false);
    setGenerateTaxRate('19');
    setGenerateObservations('');
  }, [clientSearch]);

  const selectClient = useCallback(async (client: ClientSearchResultDto) => {
    setSelectedClient(client);
    setServiceOrderToGenerate(null);
    setServiceOrderDetail(null);
    setServiceOrderDetailError(null);
    setGenerateError(null);
    setClientServiceOrdersLoading(true);
    setClientServiceOrdersError(null);

    try {
      const response = await receptionistClientsApi.getClientServiceOrders(client.personId);
      setClientServiceOrders(response.data);
    } catch (error) {
      setClientServiceOrders([]);
      setClientServiceOrdersError(getErrorMessage(error));
    } finally {
      setClientServiceOrdersLoading(false);
    }
  }, []);

  const selectServiceOrder = useCallback(async (serviceOrderId: number) => {
    setServiceOrderToGenerate(serviceOrderId);
    setServiceOrderDetailError(null);
    setServiceOrderDetailLoading(true);

    try {
      const response = await receptionistServiceOrdersApi.getServiceOrderFullDetail(serviceOrderId);
      setServiceOrderDetail(response.data);
    } catch (error) {
      setServiceOrderDetailError(getErrorMessage(error));
      setServiceOrderDetail(null);
    } finally {
      setServiceOrderDetailLoading(false);
    }
  }, []);

  const submitGenerateInvoice = useCallback(async () => {
    if (!serviceOrderToGenerate) {
      setGenerateError('Select a service order first.');
      return;
    }

    if (taxRateValue === null || estimatedTaxAmount === null) {
      setGenerateError('Tax rate must be a number between 0 and 100.');
      return;
    }

    if (!hasBillableItems) {
      setGenerateError('Only approved services and approved parts will be invoiced.');
      return;
    }

    setGenerateLoading(true);
    setGenerateError(null);

    try {
      const response = await receptionistInvoicesApi.generateFromServiceOrder(
        serviceOrderToGenerate,
        {
          tax: Number(estimatedTaxAmount.toFixed(2)),
          ...(generateObservations.trim()
            ? { observations: generateObservations.trim() }
            : {}),
        },
      );

      setSuccessMessage(`Invoice ${response.data.invoiceNumber} generated successfully.`);
      closeGenerateModal();
      refreshInvoices();
      openInvoiceDetail(response.data.invoiceId);
    } catch (error) {
      setGenerateError(getErrorMessage(error));
    } finally {
      setGenerateLoading(false);
    }
  }, [
    serviceOrderToGenerate,
    taxRateValue,
    estimatedTaxAmount,
    hasBillableItems,
    generateObservations,
    closeGenerateModal,
    refreshInvoices,
    openInvoiceDetail,
  ]);

  if (invoiceRequest.isLoading && !isSearchingInvoices) {
    return (
      <LoadingState
        title="Loading invoices"
        description="Getting reception invoices for billing operations."
        className="min-h-[320px]"
      />
    );
  }

  return (
    <div className="space-y-6">
      <ReceptionistPageHeader
        title="Invoicing"
        description="Search invoices, generate invoices from service orders, and process billing actions."
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<RefreshCw className="size-4" />}
              onClick={refreshInvoices}
            >
              Refresh
            </Button>
            <Button onClick={openGenerateModal}>Generate invoice</Button>
          </>
        }
      />

      {successMessage ? (
        <div
          role="status"
          className="rounded-lg border border-success/30 bg-success-muted/40 px-4 py-3 text-sm text-success"
        >
          {successMessage}
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-bg-surface p-4">
        <Input
          label="Search invoices"
          name="invoice-search"
          placeholder="Search by invoice number, invoice ID, or service order ID"
          hint="Search by invoice number, invoice ID, or service order ID."
          value={invoiceSearch.term}
          onChange={(event) => invoiceSearch.setTerm(event.target.value)}
        />
        {invoiceSearch.termTooShort ? (
          <p className="mt-2 text-xs text-text-secondary">
            Search needs at least {invoiceSearch.minTermLength} characters.
          </p>
        ) : null}
      </div>

      <InvoicesTable
        invoiceRows={invoiceRows}
        statusNameById={invoiceLookups.lookups.invoiceStatusNameById}
        isLoading={isSearchingInvoices ? invoiceSearch.isSearching : invoiceRequest.isLoading}
        error={isSearchingInvoices ? invoiceSearch.error : invoiceRequest.error}
        hasSearched={isSearchingInvoices ? invoiceSearch.hasSearched : false}
        searchTerm={invoiceSearch.term}
        onRetry={isSearchingInvoices ? invoiceSearch.reload : invoiceRequest.retry}
        onView={openInvoiceDetail}
      />

      <Modal
        open={detailOpen}
        onClose={closeDetail}
        title={invoiceDetail ? `Invoice ${invoiceDetail.invoiceNumber}` : 'Invoice detail'}
        description="Review invoice detail and payment summary."
        size="lg"
      >
        {invoiceDetailLoading ? (
          <LoadingState
            title="Loading invoice detail"
            description="Getting invoice record and payment summary."
          />
        ) : invoiceDetailError ? (
          <ErrorState
            title="Unable to load invoice detail"
            message={invoiceDetailError}
            onRetry={() => {
              if (selectedInvoiceId) {
                void loadInvoiceDetail(selectedInvoiceId);
              }
            }}
          />
        ) : !invoiceDetail ? (
          <div className="text-sm text-text-secondary">No invoice loaded.</div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                <p>Invoice number: {invoiceDetail.invoiceNumber}</p>
                <p>Service order: #{invoiceDetail.serviceOrderId}</p>
                <p>
                  Status:{' '}
                  {formatInvoiceStatusLabel(
                    invoiceDetail.invoiceStatusId,
                    invoiceLookups.lookups.invoiceStatusNameById,
                  )}
                </p>
                <p>Issue date: {formatDateTime(invoiceDetail.invoiceDate)}</p>
                <p>Subtotal: {formatCurrency(invoiceDetail.subtotal)}</p>
                <p>Tax: {formatCurrency(invoiceDetail.tax)}</p>
                <p>Total: {formatCurrency(invoiceDetail.total)}</p>
                <p>Observations: {invoiceDetail.observations || '—'}</p>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                leftIcon={<Calculator className="size-4" />}
                isLoading={actionLoading}
                onClick={recalculateInvoice}
              >
                Recalculate
              </Button>
              {invoiceDetail.invoiceStatusId === RECEPTIONIST_INVOICE_STATUS_IDS.draft ? (
                <Button
                  leftIcon={<Send className="size-4" />}
                  isLoading={actionLoading}
                  onClick={issueInvoice}
                >
                  Issue
                </Button>
              ) : null}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment summary</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentSummaryLoading ? (
                  <LoadingState
                    title="Loading payment summary"
                    description="Loading payment breakdown."
                  />
                ) : paymentSummaryError ? (
                  <ErrorState
                    title="Unable to load payment summary"
                    message={paymentSummaryError}
                    onRetry={() => {
                      if (selectedInvoiceId) {
                        setPaymentSummaryLoading(true);
                        receptionistInvoicesApi
                          .getPaymentSummary(selectedInvoiceId)
                          .then((response) => {
                            setPaymentSummary(response.data);
                            setPaymentSummaryError(null);
                          })
                          .catch((error) => {
                            setPaymentSummaryError(getErrorMessage(error));
                          })
                          .finally(() => {
                            setPaymentSummaryLoading(false);
                          });
                      }
                    }}
                  />
                  ) : paymentSummary ? (
                    <div className="space-y-3 text-sm">
                      <p>Invoice total: {formatCurrency(paymentSummary.invoiceTotal)}</p>
                      <p>Completed paid: {formatCurrency(paymentSummary.completedPaidAmount)}</p>
                      <p>Refunded: {formatCurrency(paymentSummary.refundedAmount)}</p>
                      <p>Pending amount: {formatCurrency(paymentSummary.pendingAmount)}</p>

                      {paymentSummary.payments.length === 0 ? (
                        <EmptyState
                          title="No payments"
                          description="No payment entries registered yet."
                          className="mt-3 border-0 bg-transparent p-0"
                        />
                      ) : (
                        <div className="space-y-2 text-sm">
                          {paymentSummary.payments.map((payment) => (
                            <div
                              key={payment.paymentId}
                              className="rounded-md border border-border bg-bg-elevated px-3 py-2"
                            >
                              <p className="font-medium">Payment #{payment.paymentId}</p>
                              <p>{formatDateTime(payment.paymentDate)}</p>
                              <p>{formatCurrency(payment.amount)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary">No payment summary loaded.</p>
                  )}
              </CardContent>
            </Card>
          </div>
        )}
      </Modal>

      <Modal
        open={generateOpen}
        onClose={closeGenerateModal}
        title="Generate invoice"
        description="Select a service order and generate the corresponding invoice."
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Search customer by document number"
            name="customer-document-search"
            placeholder="Enter document number, name, phone or email"
            value={clientSearch.term}
            onChange={(event) => {
              clientSearch.setTerm(event.target.value);
              setSelectedClient(null);
              setClientServiceOrders([]);
              setClientServiceOrdersError(null);
              setServiceOrderToGenerate(null);
              setServiceOrderDetail(null);
              setServiceOrderDetailError(null);
              setGenerateError(null);
            }}
          />
          {clientSearch.termTooShort ? (
            <p className="text-xs text-text-secondary">
              Search needs at least {clientSearch.minTermLength} characters.
            </p>
          ) : null}

          <p className="text-xs text-text-secondary">
            Plate search for invoices is pending backend support.
          </p>

          {clientSearch.isSearching ? (
            <LoadingState
              title="Searching customers"
              description="Looking up matching customer records."
            />
          ) : clientSearch.error ? (
            <ErrorState
              title="Unable to search customers"
              message={clientSearch.error}
              onRetry={clientSearch.reload}
            />
          ) : clientSearch.hasSearched && clientSearch.results.length === 0 ? (
            <EmptyState
              title={`No customers for "${clientSearch.term}"`}
              description="Try another document number, name, phone, or email."
              className="bg-bg-elevated py-6"
            />
          ) : (
            <ClientSelectionList
              rows={clientSearch.results}
              selectedClientId={selectedClient?.personId ?? null}
              onSelect={selectClient}
            />
          )}

          {selectedClient ? (
            <div className="rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm">
              <p className="font-medium text-text-primary">{selectedClient.fullName}</p>
              <p className="text-text-secondary">Document {selectedClient.documentNumber}</p>
            </div>
          ) : null}

          {clientServiceOrdersLoading ? (
            <LoadingState
              title="Loading customer service orders"
              description="Getting service orders for the selected customer."
            />
          ) : clientServiceOrdersError ? (
            <ErrorState
              title="Unable to load customer service orders"
              message={clientServiceOrdersError}
              onRetry={() => {
                if (selectedClient) {
                  void selectClient(selectedClient);
                }
              }}
            />
          ) : selectedClient ? (
            <ClientServiceOrderSelectionList
              rows={clientServiceOrders}
              selectedServiceOrderId={serviceOrderToGenerate}
              onSelect={selectServiceOrder}
              orderStatusNameById={workshopCatalogs.lookups.orderStatusNameById}
            />
          ) : null}

          {serviceOrderDetailLoading ? (
            <LoadingState
              title="Loading service order detail"
              description="Validating selected service order."
            />
          ) : serviceOrderDetail ? (
            <Card>
              <CardHeader>
                <CardTitle>Selected order #{serviceOrderDetail.serviceOrderId}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-text-secondary">
                <div className="grid gap-1">
                  <p>Vehicle #{serviceOrderDetail.vehicleId}</p>
                  <p>Entry date: {formatDateTime(serviceOrderDetail.entryDate)}</p>
                  <p>
                    Estimated delivery:{' '}
                    {serviceOrderDetail.estimatedDeliveryDate
                      ? formatDateTime(serviceOrderDetail.estimatedDeliveryDate)
                      : '—'}
                  </p>
                  <p>Description: {serviceOrderDetail.generalDescription || '—'}</p>
                  <p>Services: {serviceOrderDetail.services.length}</p>
                  <p>
                    Approved services subtotal:{' '}
                    {formatCurrency(getApprovedServicesSubtotal(serviceOrderDetail))}
                  </p>
                  <p>
                    Approved parts subtotal:{' '}
                    {formatCurrency(getApprovedPartsSubtotal(serviceOrderDetail))}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-text-primary">Approved labor items</p>
                  {approvedServices.length === 0 ? (
                    <p>No approved services available for invoicing.</p>
                  ) : (
                    <div className="space-y-2">
                      {approvedServices.map((service) => (
                        <div
                          key={service.orderServiceId}
                          className="rounded-md border border-border bg-bg-elevated px-3 py-2"
                        >
                          <p className="font-medium text-text-primary">
                            {workshopCatalogs.lookups.serviceTypeNameById.get(
                              service.serviceTypeId,
                            ) ?? `Service type #${service.serviceTypeId}`}
                          </p>
                          <p>{service.description || 'No description'}</p>
                          <p>{formatCurrency(service.laborCost)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-text-primary">Approved part items</p>
                  {approvedParts.length === 0 ? (
                    <p>No approved parts available for invoicing.</p>
                  ) : (
                    <div className="space-y-2">
                      {approvedParts.map((part) => (
                        <div
                          key={part.orderServicePartId}
                          className="rounded-md border border-border bg-bg-elevated px-3 py-2"
                        >
                          <p className="font-medium text-text-primary">Part #{part.partId}</p>
                          <p>
                            Qty {part.quantity} / Unit{' '}
                            {formatCurrency(part.appliedUnitPrice)}
                          </p>
                          <p>{formatCurrency(part.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {serviceOrderDetailError ? (
            <ErrorState title="Unable to load order detail" message={serviceOrderDetailError} />
          ) : null}

          <div className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-secondary">
            Invoice number will be generated automatically.
          </div>

          <Input
            label="Tax rate (%)"
            name="invoice-tax-rate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={generateTaxRate}
            onChange={(event) => setGenerateTaxRate(event.target.value)}
            required
          />

          <div className="grid gap-2 rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm">
            <p>Estimated subtotal: {formatCurrency(estimatedSubtotal)}</p>
            <p>Tax rate: {taxRateValue === null ? 'Invalid' : `${taxRateValue}%`}</p>
            <p>
              Tax amount:{' '}
              {estimatedTaxAmount === null ? 'Invalid' : formatCurrency(estimatedTaxAmount)}
            </p>
            <p>
              Estimated total:{' '}
              {estimatedTotal === null ? 'Invalid' : formatCurrency(estimatedTotal)}
            </p>
            <p className="text-text-secondary">
              Only approved services and approved parts will be invoiced.
            </p>
            {serviceOrderDetail && !hasBillableItems ? (
              <p className="text-danger">
                This order has no approved services or approved parts to invoice.
              </p>
            ) : null}
          </div>

          <Textarea
            label="Observations"
            name="invoice-observations"
            rows={4}
            value={generateObservations}
            onChange={(event) => setGenerateObservations(event.target.value)}
          />

          {generateError ? (
            <div
              className="rounded-lg border border-danger/30 bg-danger-muted/30 px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {generateError}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={closeGenerateModal}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                void submitGenerateInvoice();
              }}
              isLoading={generateLoading}
              disabled={
                !serviceOrderToGenerate ||
                taxRateValue === null ||
                serviceOrderDetailLoading ||
                !hasBillableItems
              }
              leftIcon={<Send className="size-4" />}
            >
              Generate Invoice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}



