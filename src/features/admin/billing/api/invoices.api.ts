import { httpClient } from '@/api/httpClient';
import type {
  CancelInvoiceRequest,
  CreateInvoiceRequest,
  GeneratedInvoiceDto,
  InvoiceBusinessResultDto,
  InvoiceDto,
  InvoiceSearchResultDto,
  GenerateInvoiceFromServiceOrderRequest,
  UpdateInvoiceRequest,
} from '@/features/admin/billing/types/invoices.types';

export const invoicesApi = {
  getAll() {
    return httpClient.get<InvoiceDto[]>('/api/invoices');
  },

  getById(id: number) {
    return httpClient.get<InvoiceDto>(`/api/invoices/${id}`);
  },

  create(body: CreateInvoiceRequest) {
    return httpClient.post<InvoiceDto>('/api/invoices', body);
  },

  update(id: number, body: UpdateInvoiceRequest) {
    return httpClient.put<InvoiceDto>(`/api/invoices/${id}`, body);
  },

  delete(id: number) {
    return httpClient.delete<void>(`/api/invoices/${id}`);
  },

  search(term: string) {
    return httpClient.get<InvoiceSearchResultDto[]>('/api/search/invoices', {
      params: { term },
    });
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

  recalculate(id: number) {
    return httpClient.post<InvoiceBusinessResultDto>(
      `/api/invoices/${id}/recalculate`,
    );
  },

  issue(id: number) {
    return httpClient.post<InvoiceBusinessResultDto>(`/api/invoices/${id}/issue`);
  },

  cancel(id: number, body: CancelInvoiceRequest) {
    return httpClient.post<InvoiceBusinessResultDto>(
      `/api/invoices/${id}/cancel`,
      body,
    );
  },
};
