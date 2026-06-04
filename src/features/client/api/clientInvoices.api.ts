import { httpClient } from '@/api/httpClient';
import type {
  ClientInvoiceDetailsByInvoiceDto,
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

  async getInvoiceDetails(invoiceId: number) {
    const response = await httpClient.get<ClientInvoiceDetailsByInvoiceDto>(
      `/api/invoices/${invoiceId}/details`,
    );

    return {
      ...response,
      data: response.data.details.map((detail) => ({
        ...detail,
        invoiceId: response.data.invoiceId,
      })),
    };
  },
};
