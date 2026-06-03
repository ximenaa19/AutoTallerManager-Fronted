import { httpClient } from '@/api/httpClient';
import type {
  ClientInvoiceDetailDto,
  ClientInvoiceDto,
  ClientInvoicePaymentSummaryDto,
} from '@/features/client/types/clientInvoices.types';

export const clientInvoicesApi = {
  getMyInvoices() {
    return httpClient.get<ClientInvoiceDto[]>('/api/client/my-invoices');
  },

  getInvoicePaymentSummary(invoiceId: number) {
    return httpClient.get<ClientInvoicePaymentSummaryDto>(
      `/api/invoices/${invoiceId}/payment-summary`,
    );
  },

  getInvoiceDetails(invoiceId: number) {
    return httpClient.get<ClientInvoiceDetailDto[]>(`/api/invoices/${invoiceId}/details`);
  },
};
