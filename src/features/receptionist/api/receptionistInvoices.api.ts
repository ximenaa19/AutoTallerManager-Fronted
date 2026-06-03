import { httpClient } from '@/api/httpClient';
import type {
  GeneratedInvoiceDto,
  InvoiceDto,
  InvoicePaymentSummaryDto,
  InvoiceSearchResultDto,
  InvoiceBusinessResultDto,
} from '@/features/receptionist/types/receptionistInvoices.types';
import type { GenerateInvoiceFromServiceOrderRequest } from '@/features/receptionist/types/receptionistInvoices.types';

export const receptionistInvoicesApi = {
  searchInvoices(term: string) {
    return httpClient.get<InvoiceSearchResultDto[]>('/api/search/invoices', {
      params: { term },
    });
  },

  getAll() {
    return httpClient.get<InvoiceDto[]>('/api/invoices');
  },

  getById(invoiceId: number) {
    return httpClient.get<InvoiceDto>(`/api/invoices/${invoiceId}`);
  },

  generateFromServiceOrder(
    serviceOrderId: number,
    body: GenerateInvoiceFromServiceOrderRequest,
  ) {
    return httpClient.post<GeneratedInvoiceDto>(
      `/api/invoices/generate-from-service-order/${serviceOrderId}`,
      body,
    );
  },

  recalculate(invoiceId: number) {
    return httpClient.post<InvoiceBusinessResultDto>(`/api/invoices/${invoiceId}/recalculate`);
  },

  issue(invoiceId: number) {
    return httpClient.post<InvoiceBusinessResultDto>(`/api/invoices/${invoiceId}/issue`);
  },

  getPaymentSummary(invoiceId: number) {
    return httpClient.get<InvoicePaymentSummaryDto>(
      `/api/invoices/${invoiceId}/payment-summary`,
    );
  },
};
