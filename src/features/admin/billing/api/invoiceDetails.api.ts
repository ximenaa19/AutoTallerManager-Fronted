import { httpClient } from '@/api/httpClient';
import type {
  InvoiceDetailDto,
  InvoiceDetailsByInvoiceDto,
} from '@/features/admin/billing/types/invoiceDetails.types';

export const invoiceDetailsApi = {
  getAll() {
    return httpClient.get<InvoiceDetailDto[]>('/api/invoice-details');
  },

  getById(id: number) {
    return httpClient.get<InvoiceDetailDto>(`/api/invoice-details/${id}`);
  },

  getByInvoiceId(invoiceId: number) {
    return httpClient.get<InvoiceDetailsByInvoiceDto>(
      `/api/invoices/${invoiceId}/details`,
    );
  },
};
