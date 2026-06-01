import { httpClient } from '@/api/httpClient';
import type {
  CreateSupplierRequest,
  SupplierDto,
  SupplierSearchResultDto,
  UpdateSupplierRequest,
} from '@/features/admin/inventory/types/suppliers.types';

export const suppliersApi = {
  getAll() {
    return httpClient.get<SupplierDto[]>('/api/suppliers');
  },

  getById(id: number) {
    return httpClient.get<SupplierDto>(`/api/suppliers/${id}`);
  },

  create(body: CreateSupplierRequest) {
    return httpClient.post<SupplierDto>('/api/suppliers', body);
  },

  update(id: number, body: UpdateSupplierRequest) {
    return httpClient.put<SupplierDto>(`/api/suppliers/${id}`, body);
  },

  delete(id: number) {
    return httpClient.delete<void>(`/api/suppliers/${id}`);
  },

  search(term: string) {
    return httpClient.get<SupplierSearchResultDto[]>('/api/search/suppliers', {
      params: { term },
    });
  },
};
