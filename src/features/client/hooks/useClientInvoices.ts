import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage, isApiError } from '@/api/apiError';
import { clientInvoicesApi } from '@/features/client/api/clientInvoices.api';
import type {
  ClientInvoiceDetailDto,
  ClientInvoiceDto,
  ClientInvoicePaymentSummaryDto,
} from '@/features/client/types/clientInvoices.types';

export function useClientInvoices() {
  const [invoices, setInvoices] = useState<ClientInvoiceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoiceDto | null>(null);
  const [paymentSummary, setPaymentSummary] =
    useState<ClientInvoicePaymentSummaryDto | null>(null);
  const [paymentSummaryLoading, setPaymentSummaryLoading] = useState(false);
  const [paymentSummaryError, setPaymentSummaryError] = useState<string | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<ClientInvoiceDetailDto[]>([]);
  const [invoiceDetailsLoading, setInvoiceDetailsLoading] = useState(false);
  const [invoiceDetailsError, setInvoiceDetailsError] = useState<string | null>(null);
  const [invoiceDetailsAuthorizationPending, setInvoiceDetailsAuthorizationPending] =
    useState(false);

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientInvoicesApi.getMyInvoices();
      setInvoices(response.data);
    } catch (loadError) {
      setInvoices([]);
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPaymentSummary = useCallback(async (invoiceId: number) => {
    setPaymentSummaryLoading(true);
    setPaymentSummaryError(null);
    setPaymentSummary(null);

    try {
      const response = await clientInvoicesApi.getInvoicePaymentSummary(invoiceId);
      setPaymentSummary(response.data);
    } catch (loadError) {
      setPaymentSummaryError(getErrorMessage(loadError));
    } finally {
      setPaymentSummaryLoading(false);
    }
  }, []);

  const loadInvoiceDetails = useCallback(async (invoiceId: number) => {
    setInvoiceDetailsLoading(true);
    setInvoiceDetailsError(null);
    setInvoiceDetails([]);
    setInvoiceDetailsAuthorizationPending(false);

    try {
      const response = await clientInvoicesApi.getInvoiceDetails(invoiceId);
      setInvoiceDetails(response.data);
    } catch (loadError) {
      const isAuthorizationError =
        isApiError(loadError) && (loadError.status === 401 || loadError.status === 403);

      setInvoiceDetailsAuthorizationPending(isAuthorizationError);
      setInvoiceDetailsError(
        isAuthorizationError
          ? 'Invoice lines are pending backend authorization for Client. Payment summary is still available.'
          : getErrorMessage(loadError),
      );
    } finally {
      setInvoiceDetailsLoading(false);
    }
  }, []);

  const loadInvoiceDetailData = useCallback(
    (invoiceId: number) => {
      void loadPaymentSummary(invoiceId);
      void loadInvoiceDetails(invoiceId);
    },
    [loadInvoiceDetails, loadPaymentSummary],
  );

  const openInvoiceDetail = useCallback(
    (invoice: ClientInvoiceDto) => {
      setSelectedInvoice(invoice);
      loadInvoiceDetailData(invoice.invoiceId);
    },
    [loadInvoiceDetailData],
  );

  const retryInvoiceDetail = useCallback(() => {
    if (selectedInvoice) {
      loadInvoiceDetailData(selectedInvoice.invoiceId);
    }
  }, [loadInvoiceDetailData, selectedInvoice]);

  const closeInvoiceDetail = useCallback(() => {
    setSelectedInvoice(null);
    setPaymentSummary(null);
    setPaymentSummaryError(null);
    setPaymentSummaryLoading(false);
    setInvoiceDetails([]);
    setInvoiceDetailsError(null);
    setInvoiceDetailsLoading(false);
    setInvoiceDetailsAuthorizationPending(false);
  }, []);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  return {
    invoices,
    isLoading,
    error,
    retry: loadInvoices,
    selectedInvoice,
    paymentSummary,
    paymentSummaryLoading,
    paymentSummaryError,
    invoiceDetails,
    invoiceDetailsLoading,
    invoiceDetailsError,
    invoiceDetailsAuthorizationPending,
    openInvoiceDetail,
    retryInvoiceDetail,
    closeInvoiceDetail,
  };
}
