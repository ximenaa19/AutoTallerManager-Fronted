import { httpClient } from '@/api/httpClient';
import type {
  CreatePartPurchaseDetailRequest,
  CreatePartPurchaseRequest,
  PartPurchaseDetailDto,
  PartPurchaseDto,
  UpdatePartPurchaseRequest,
} from '@/features/admin/inventory/types/purchases.types';

export const purchasesApi = {
  getAll() {
    return httpClient.get<PartPurchaseDto[]>('/api/part-purchases');
  },

  getById(id: number) {
    return httpClient.get<PartPurchaseDto>(`/api/part-purchases/${id}`);
  },

  create(body: CreatePartPurchaseRequest) {
    return httpClient.post<PartPurchaseDto>('/api/part-purchases', body);
  },

  createDetail(body: CreatePartPurchaseDetailRequest) {
    return httpClient.post<PartPurchaseDetailDto>(
      '/api/part-purchase-details',
      body,
    );
  },

  update(id: number, body: UpdatePartPurchaseRequest) {
    return httpClient.put<PartPurchaseDto>(`/api/part-purchases/${id}`, body);
  },

  delete(id: number) {
    return httpClient.delete<void>(`/api/part-purchases/${id}`);
  },

  getAllDetails() {
    return httpClient.get<PartPurchaseDetailDto[]>('/api/part-purchase-details');
  },
};
