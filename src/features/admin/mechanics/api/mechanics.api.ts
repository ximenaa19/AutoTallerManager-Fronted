import { httpClient } from '@/api/httpClient';
import type { MechanicSearchResultDto } from '@/features/admin/mechanics/types/mechanics.types';
import type {
  AdminMechanicDetailDto,
  AdminMechanicListItemDto,
  AdminMechanicWorkloadDto,
} from '@/features/admin/mechanics/types/adminMechanics.types';

export const mechanicsApi = {
  searchMechanics(term: string) {
    return httpClient.get<MechanicSearchResultDto[]>('/api/search/mechanics', {
      params: { term },
    });
  },

  getAll() {
    return httpClient.get<AdminMechanicListItemDto[]>('/api/admin/mechanics');
  },

  getByPersonId(personId: number) {
    return httpClient.get<AdminMechanicDetailDto>(
      `/api/admin/mechanics/${personId}`,
    );
  },

  getWorkload(personId: number) {
    return httpClient.get<AdminMechanicWorkloadDto>(
      `/api/admin/mechanics/${personId}/workload`,
    );
  },
};
