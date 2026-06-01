import { httpClient } from '@/api/httpClient';
import type {
  CreatePartRequest,
  PartDto,
  PartSearchResultDto,
  UpdatePartRequest,
} from '@/features/admin/inventory/types/parts.types';

export const partsApi = {
  getAll() {
    return httpClient.get<PartDto[]>('/api/parts');
  },

  getById(id: number) {
    return httpClient.get<PartDto>(`/api/parts/${id}`);
  },

  create(body: CreatePartRequest) {
    return httpClient.post<PartDto>('/api/parts', body);
  },

  update(id: number, body: UpdatePartRequest) {
    return httpClient.put<PartDto>(`/api/parts/${id}`, body);
  },

  delete(id: number) {
    return httpClient.delete<void>(`/api/parts/${id}`);
  },

  search(term: string) {
    return httpClient.get<PartSearchResultDto[]>('/api/search/parts', {
      params: { term },
    });
  },
};
