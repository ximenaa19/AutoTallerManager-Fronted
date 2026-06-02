import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { httpClient } from '@/api/httpClient';
import type {
  InvoiceStatusDto,
  PaymentMethodDto,
  PaymentStatusDto,
  CardTypeDto,
} from '@/features/admin/catalogs/types/catalogs.types';

export interface BillingLookups {
  invoiceStatusNameById: Map<number, string>;
  paymentStatusNameById: Map<number, string>;
  paymentMethodNameById: Map<number, string>;
  cardTypeNameById: Map<number, string>;
  invoiceStatuses: InvoiceStatusDto[];
  paymentStatuses: PaymentStatusDto[];
  paymentMethods: PaymentMethodDto[];
  cardTypes: CardTypeDto[];
}

const emptyLookups: BillingLookups = {
  invoiceStatusNameById: new Map(),
  paymentStatusNameById: new Map(),
  paymentMethodNameById: new Map(),
  cardTypeNameById: new Map(),
  invoiceStatuses: [],
  paymentStatuses: [],
  paymentMethods: [],
  cardTypes: [],
};

export function useBillingLookups() {
  const [lookups, setLookups] = useState<BillingLookups>(emptyLookups);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        invoiceStatusesResponse,
        paymentStatusesResponse,
        paymentMethodsResponse,
        cardTypesResponse,
      ] = await Promise.all([
        httpClient.get<InvoiceStatusDto[]>('/api/invoice-statuses'),
        httpClient.get<PaymentStatusDto[]>('/api/payment-statuses'),
        httpClient.get<PaymentMethodDto[]>('/api/payment-methods'),
        httpClient.get<CardTypeDto[]>('/api/card-types'),
      ]);

      setLookups({
        invoiceStatusNameById: new Map(
          invoiceStatusesResponse.data.map((status) => [
            status.invoiceStatusId,
            status.name,
          ]),
        ),
        paymentStatusNameById: new Map(
          paymentStatusesResponse.data.map((status) => [
            status.paymentStatusId,
            status.name,
          ]),
        ),
        paymentMethodNameById: new Map(
          paymentMethodsResponse.data.map((method) => [
            method.paymentMethodId,
            method.name,
          ]),
        ),
        cardTypeNameById: new Map(
          cardTypesResponse.data.map((cardType) => [
            cardType.cardTypeId,
            cardType.name,
          ]),
        ),
        invoiceStatuses: invoiceStatusesResponse.data,
        paymentStatuses: paymentStatusesResponse.data,
        paymentMethods: paymentMethodsResponse.data,
        cardTypes: cardTypesResponse.data,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { lookups, isLoading, error, retry: load };
}

export function formatInvoiceStatusLabelFromLookups(
  invoiceStatusId: number,
  lookups: BillingLookups,
): string {
  return (
    lookups.invoiceStatusNameById.get(invoiceStatusId) ??
    `Status #${invoiceStatusId}`
  );
}

export function formatPaymentStatusLabelFromLookups(
  paymentStatusId: number,
  lookups: BillingLookups,
): string {
  return (
    lookups.paymentStatusNameById.get(paymentStatusId) ??
    `Status #${paymentStatusId}`
  );
}

export function formatPaymentMethodLabelFromLookups(
  paymentMethodId: number,
  lookups: BillingLookups,
): string {
  return (
    lookups.paymentMethodNameById.get(paymentMethodId) ??
    `Method #${paymentMethodId}`
  );
}
