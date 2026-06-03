import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { getErrorMessage } from '@/api/apiError';
import { receptionistPaymentsApi } from '@/features/receptionist/api/receptionistPayments.api';
import { useReceptionistInvoiceLookups } from '@/features/receptionist/hooks/useReceptionistInvoiceLookups';
import { useReceptionistInvoicePaymentSearch } from '@/features/receptionist/hooks/useReceptionistInvoicePaymentSearch';
import { useReceptionistPaymentForm } from '@/features/receptionist/hooks/useReceptionistPaymentForm';
import { ReceptionistPageHeader } from '@/features/receptionist/components/ReceptionistPageHeader';
import {
  formatCurrency,
  formatDateTime,
} from '@/utils/format';
import type {
  InvoicePaymentSummaryDto,
  InvoiceSearchResultDto,
} from '@/features/receptionist/types/receptionistPayments.types';

function resolvePendingAmount(summary: InvoicePaymentSummaryDto | null): number | null {
  if (!summary) {
    return null;
  }

  if (typeof summary.pendingAmount === 'number') {
    return summary.pendingAmount;
  }

  return null;
}

function resolvePaidAmount(summary: InvoicePaymentSummaryDto | null): number {
  if (!summary) {
    return 0;
  }

  if (typeof summary.completedPaidAmount === 'number') {
    return summary.completedPaidAmount;
  }

  return summary.paidAmount ?? 0;
}

function resolveRefundAmount(summary: InvoicePaymentSummaryDto | null): number {
  if (!summary) {
    return 0;
  }

  return summary.refundedAmount ?? 0;
}

function isCardMethod(methodName: string | undefined) {
  return Boolean(methodName && methodName.toLowerCase().includes('card'));
}

export function ReceptionistPaymentsPage() {
  const invoiceSearch = useReceptionistInvoicePaymentSearch({ minTermLength: 2 });
  const paymentForm = useReceptionistPaymentForm();
  const invoiceLookups = useReceptionistInvoiceLookups();
  const paymentCatalogs = useAsyncRequest(() => receptionistPaymentsApi.getPaymentCatalogs(), []);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceSearchResultDto | null>(
    null,
  );
  const [paymentSummary, setPaymentSummary] = useState<InvoicePaymentSummaryDto | null>(null);
  const [paymentSummaryLoading, setPaymentSummaryLoading] = useState(false);
  const [paymentSummaryError, setPaymentSummaryError] = useState<string | null>(null);
  const [paymentSummaryRefreshToken, setPaymentSummaryRefreshToken] = useState(0);
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [catalogDefaultsLoaded, setCatalogDefaultsLoaded] = useState(false);

  const paymentMethodById = useMemo(() => {
    const map = new Map<number, string>();
    paymentCatalogs.data?.paymentMethods.forEach((method) =>
      map.set(method.id, method.name),
    );
    return map;
  }, [paymentCatalogs.data?.paymentMethods]);

  const paymentStatusById = useMemo(() => {
    const map = new Map<number, string>();
    paymentCatalogs.data?.paymentStatuses.forEach((status) =>
      map.set(status.id, status.name),
    );
    return map;
  }, [paymentCatalogs.data?.paymentStatuses]);

  const paymentMethodOptions = useMemo(
    () =>
      paymentCatalogs.data?.paymentMethods.map((method) => ({
        label: method.name,
        value: String(method.id),
      })) ?? [],
    [paymentCatalogs.data?.paymentMethods],
  );

  const paymentStatusOptions = useMemo(
    () =>
      paymentCatalogs.data?.paymentStatuses.map((status) => ({
        label: status.name,
        value: String(status.id),
      })) ?? [],
    [paymentCatalogs.data?.paymentStatuses],
  );

  const cardTypeOptions = useMemo(
    () =>
      paymentCatalogs.data?.cardTypes.map((cardType) => ({
        label: cardType.name,
        value: String(cardType.id),
      })) ?? [],
    [paymentCatalogs.data?.cardTypes],
  );

  const invoiceStatusLabel = useMemo(() => {
    if (!selectedInvoice) {
      return '—';
    }
    return (
      invoiceLookups.lookups.invoiceStatusNameById.get(selectedInvoice.invoiceStatusId) ??
      `Status #${selectedInvoice.invoiceStatusId}`
    );
  }, [invoiceLookups.lookups.invoiceStatusNameById, selectedInvoice]);

  const summaryStatusLabel = useMemo(() => {
    if (!paymentSummary) {
      return '—';
    }

    if (paymentSummary.invoiceStatusId == null) {
      return '—';
    }

    return (
      paymentSummaryStatusLabel(paymentSummary.invoiceStatusId) ??
      `Status #${paymentSummary.invoiceStatusId}`
    );

    function paymentSummaryStatusLabel(invoiceStatusId: number): string | undefined {
      return (
        invoiceLookups.lookups.invoiceStatusNameById.get(invoiceStatusId) ??
        undefined
      );
    }
  }, [paymentSummary, invoiceLookups.lookups.invoiceStatusNameById]);

  const selectedPaymentMethodId = paymentForm.getPaymentMethodIdNumber();
  const selectedPaymentMethodName = paymentMethodById.get(selectedPaymentMethodId);
  const selectedIsCardMethod = isCardMethod(selectedPaymentMethodName);

  const selectedInvoiceId = selectedInvoice?.invoiceId ?? null;
  const pendingAmount = resolvePendingAmount(paymentSummary);

  const clearPaymentMessages = useCallback(() => {
    setRecordError(null);
    setSuccessMessage(null);
  }, []);

  useEffect(() => {
    const defaultMethodId = paymentCatalogs.data?.paymentMethods?.[0]?.id;
    const defaultStatusId = paymentCatalogs.data?.paymentStatuses?.[0]?.id;

    if (!catalogDefaultsLoaded && (defaultMethodId || defaultStatusId)) {
      paymentForm.reset({
        paymentMethodId: defaultMethodId,
        paymentStatusId: defaultStatusId,
      });
      setCatalogDefaultsLoaded(true);
    }
  }, [
    catalogDefaultsLoaded,
    paymentCatalogs.data?.paymentMethods,
    paymentCatalogs.data?.paymentStatuses,
    paymentForm,
  ]);

  useEffect(() => {
    if (selectedInvoiceId === null) {
      setPaymentSummary(null);
      setPaymentSummaryError(null);
      setPaymentSummaryLoading(false);
      return;
    }

    let isActive = true;

    setPaymentSummaryLoading(true);
    setPaymentSummaryError(null);

    receptionistPaymentsApi
      .getInvoicePaymentSummary(selectedInvoiceId)
      .then((response) => {
        if (!isActive) {
          return;
        }
        setPaymentSummary(response.data);
      })
      .catch((err) => {
        if (!isActive) {
          return;
        }
        setPaymentSummary(null);
        setPaymentSummaryError(getErrorMessage(err));
      })
      .finally(() => {
        if (isActive) {
          setPaymentSummaryLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [selectedInvoiceId, paymentSummaryRefreshToken]);

  const handleInvoiceSearchChange = (value: string) => {
    invoiceSearch.setTerm(value);
    clearPaymentMessages();
    if (!value) {
      setSelectedInvoice(null);
      setPaymentSummary(null);
      setPaymentSummaryError(null);
    }
  };

  const handleSelectInvoice = (invoice: InvoiceSearchResultDto) => {
    setSelectedInvoice(invoice);
    setPaymentSummaryError(null);
    setPaymentSummary(null);
    clearPaymentMessages();
    paymentForm.reset({
      paymentMethodId: paymentForm.getPaymentMethodIdNumber(),
      paymentStatusId: Number(paymentForm.paymentStatusId),
    });
    setPaymentSummaryRefreshToken((value) => value + 1);
  };

  const refreshAll = () => {
    void paymentCatalogs.retry();
    void invoiceLookups.retry();
    invoiceSearch.reload();
    if (selectedInvoiceId) {
      setPaymentSummaryRefreshToken((value) => value + 1);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoiceId) {
      setRecordError('Select an invoice before recording a payment.');
      return;
    }

    const buildResult = paymentForm.buildRequest({
      invoiceId: selectedInvoiceId,
      isCardPayment: selectedIsCardMethod,
      pendingAmount,
    });

    if (!buildResult.request || buildResult.error) {
      setRecordError(buildResult.error ?? 'Unable to build payment request.');
      return;
    }

    setRecordLoading(true);
    setRecordError(null);

    try {
      const response = await receptionistPaymentsApi.recordPayment(
        selectedInvoiceId,
        buildResult.request,
      );
      setSuccessMessage(
        `Payment #${response.data.paymentId} recorded for invoice #${response.data.invoiceId}.`,
      );
      setPaymentSummaryRefreshToken((value) => value + 1);
      paymentForm.reset({
        paymentMethodId: buildResult.request.paymentMethodId,
        paymentStatusId: buildResult.request.paymentStatusId,
      });
    } catch (error) {
      setRecordError(getErrorMessage(error));
    } finally {
      setRecordLoading(false);
    }
  };

  const canSubmit =
    Boolean(selectedInvoiceId) &&
    !recordLoading &&
    paymentForm.paymentMethodId !== '' &&
    !paymentForm.isAmountEmpty &&
    !paymentForm.isPendingAmountExceeding(pendingAmount);

  return (
    <div className="space-y-6">
      <ReceptionistPageHeader
        title="Payments"
        description="Search invoices, review payment summary, and record payments from reception."
        actions={
          <Button variant="secondary" leftIcon={<RefreshCw className="size-4" />} onClick={refreshAll}>
            Refresh
          </Button>
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

      {recordError ? (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {recordError}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Search invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Invoice search"
            name="invoice-search"
            placeholder="Search by invoice number, invoice ID, or service order"
            value={invoiceSearch.term}
            onChange={(event) => handleInvoiceSearchChange(event.target.value)}
          />

          <div className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-secondary">
            Search requires at least {invoiceSearch.minTermLength} characters.
          </div>

          {invoiceSearch.termTooShort ? (
            <div className="text-sm text-text-secondary">
              Type at least {invoiceSearch.minTermLength} characters to search.
            </div>
          ) : null}

          {invoiceSearch.isSearching ? (
            <LoadingState title="Searching invoices" description="Using invoice search endpoint." />
          ) : invoiceSearch.error ? (
            <ErrorState
              title="Unable to search invoices"
              message={invoiceSearch.error}
              onRetry={invoiceSearch.reload}
            />
          ) : invoiceSearch.term === '' ? (
            <EmptyState
              title="Search invoices to continue"
              description="Use invoice number, invoice ID, or service order number."
              icon={<Search className="size-6" />}
            />
          ) : invoiceSearch.hasSearched && invoiceSearch.results.length === 0 ? (
            <EmptyState
              title={`No invoices for "${invoiceSearch.term}"`}
              description="Try a broader term or search by service order ID."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Service order</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-36 text-right">Select</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceSearch.results.map((invoice) => {
                    const isSelected = selectedInvoiceId === invoice.invoiceId;
                    return (
                      <TableRow
                        key={invoice.invoiceId}
                        className={isSelected ? 'bg-bg-elevated' : undefined}
                      >
                        <TableCell>#{invoice.invoiceId}</TableCell>
                        <TableCell>#{invoice.serviceOrderId}</TableCell>
                        <TableCell>{formatDateTime(invoice.invoiceDate)}</TableCell>
                        <TableCell>
                          {invoiceLookups.lookups.invoiceStatusNameById.get(
                            invoice.invoiceStatusId,
                          ) ?? `Status #${invoice.invoiceStatusId}`}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={isSelected ? 'secondary' : 'ghost'}
                            onClick={() => handleSelectInvoice(invoice)}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedInvoice ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentSummaryLoading ? (
                <LoadingState
                  title="Loading payment summary"
                  description="Fetching invoice payment details."
                />
              ) : paymentSummaryError ? (
                <ErrorState
                  title="Unable to load payment summary"
                  message={paymentSummaryError}
                  onRetry={() => setPaymentSummaryRefreshToken((value) => value + 1)}
                />
              ) : paymentSummary ? (
                <>
                  <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-bg-elevated p-3 text-sm">
                    <p>
                      Invoice:{' '}
                      <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                    </p>
                    <p>
                      Status:{' '}
                      <span className="font-medium">{summaryStatusLabel}</span>
                    </p>
                    <p>
                      Total:{' '}
                      <span className="font-medium">{formatCurrency(paymentSummary.invoiceTotal)}</span>
                    </p>
                    <p>
                      Paid:{' '}
                      <span className="font-medium">{formatCurrency(resolvePaidAmount(paymentSummary))}</span>
                    </p>
                    <p>
                      Refunded:{' '}
                      <span className="font-medium">{formatCurrency(resolveRefundAmount(paymentSummary))}</span>
                    </p>
                    <p>
                      Pending:{' '}
                      <span className="font-medium">
                        {pendingAmount === null ? '—' : formatCurrency(pendingAmount)}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-text-secondary">
                      Invoice status on list: {invoiceStatusLabel}
                    </p>
                    {paymentSummary.payments.length === 0 ? (
                      <EmptyState
                        title="No payment entries"
                        description="No recorded payment entries for this invoice."
                        className="bg-bg-elevated py-6"
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
                            <p>
                              {paymentMethodById.get(payment.paymentMethodId) ??
                                `Method #${payment.paymentMethodId}`}{' '}
                              /{' '}
                              {paymentStatusById.get(payment.paymentStatusId) ??
                                `Status #${payment.paymentStatusId}`}
                            </p>
                            <p className="font-medium text-text-primary">
                              {formatCurrency(payment.amount)}
                            </p>
                            {payment.reference ? <p>Ref: {payment.reference}</p> : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <EmptyState
                  title="Select an invoice"
                  description="Select an invoice from the list to load payment summary."
                  className="bg-bg-elevated"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Record payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Amount"
                name="payment-amount"
                type="number"
                min={0.01}
                step="0.01"
                value={paymentForm.amount}
                onChange={(event) => paymentForm.setAmount(event.target.value)}
                required
              />

              <Input
                label="Payment date (optional)"
                name="payment-date"
                type="datetime-local"
                value={paymentForm.paymentDate}
                onChange={(event) => paymentForm.setPaymentDate(event.target.value)}
              />

              <Select
                name="payment-method"
                label="Payment method"
                options={paymentMethodOptions}
                required
                value={paymentForm.paymentMethodId}
                onChange={(event) =>
                  paymentForm.setPaymentMethodId(event.target.value)
                }
                placeholder={paymentMethodOptions.length ? 'Select payment method' : 'Loading methods'}
              />

              <Select
                name="payment-status"
                label="Payment status (optional)"
                options={paymentStatusOptions}
                value={paymentForm.paymentStatusId}
                onChange={(event) =>
                  paymentForm.setPaymentStatusId(event.target.value)
                }
                placeholder={paymentStatusOptions.length ? 'Select payment status' : 'Loading statuses'}
              />

              <Input
                label="Reference (optional)"
                name="payment-reference"
                value={paymentForm.reference}
                onChange={(event) => paymentForm.setReference(event.target.value)}
              />

              {selectedIsCardMethod ? (
                <div className="space-y-4 rounded-md border border-border bg-bg-elevated p-4">
                  <p className="text-sm font-medium text-text-primary">Card details</p>
                  <Select
                    name="payment-card-type"
                    label="Card type"
                    options={cardTypeOptions}
                    required
                    value={paymentForm.cardTypeId}
                    onChange={(event) => paymentForm.setCardTypeId(event.target.value)}
                    placeholder={cardTypeOptions.length ? 'Select card type' : 'Loading card types'}
                  />

                  <Input
                    label="Last four digits"
                    name="payment-card-last-four"
                    maxLength={4}
                    value={paymentForm.lastFourDigits}
                    onChange={(event) =>
                      paymentForm.setLastFourDigits(
                        event.target.value.replace(/\D/g, '').slice(0, 4),
                      )
                    }
                    required
                    placeholder="1234"
                  />

                  <Input
                    label="Cardholder name (optional)"
                    name="payment-card-holder"
                    value={paymentForm.cardHolder}
                    onChange={(event) => paymentForm.setCardHolder(event.target.value)}
                  />

                  <Input
                    label="Authorization code (optional)"
                    name="payment-card-authorization"
                    value={paymentForm.authorizationCode}
                    onChange={(event) => paymentForm.setAuthorizationCode(event.target.value)}
                    placeholder="AUTH-001"
                  />

                  <p className="text-xs text-text-secondary">
                    Cardholder and authorization code are optional.
                  </p>
                </div>
              ) : null}

              <div className="border-t border-border pt-4">
                <Button
                  onClick={() => {
                    void handleRecordPayment();
                  }}
                  isLoading={recordLoading}
                  disabled={!canSubmit}
                >
                  Record payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
