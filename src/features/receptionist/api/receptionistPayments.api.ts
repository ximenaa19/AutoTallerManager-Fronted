import { httpClient } from '@/api/httpClient';
import type {
  InvoicePaymentSummaryDto,
  InvoiceSearchResultDto,
  PaymentCatalogsDto,
  RecordPaymentRequest,
  RecordPaymentResponseDto,
} from '@/features/receptionist/types/receptionistPayments.types';

export const receptionistPaymentsApi = {
  searchInvoices(term: string) {
    return httpClient.get<InvoiceSearchResultDto[]>('/api/search/invoices', {
      params: { term },
    });
  },

  getInvoicePaymentSummary(invoiceId: number) {
    return httpClient.get<InvoicePaymentSummaryDto>(`/api/invoices/${invoiceId}/payment-summary`);
  },

  recordPayment(invoiceId: number, request: RecordPaymentRequest) {
    return httpClient.post<RecordPaymentResponseDto>(
      `/api/invoices/${invoiceId}/record-payment`,
      request,
    );
  },

  getPaymentCatalogs() {
    return httpClient.get<PaymentCatalogsDto>('/api/catalogs/workshop');
  },
};

