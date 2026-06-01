import { httpClient } from '@/api/httpClient';
import type {
  MechanicSpecialtyDto,
  MechanicSpecialtySummaryDto,
  ReplaceMechanicSpecialtiesRequest,
} from '@/features/admin/types/mechanicSpecialties.types';

export const mechanicSpecialtiesApi = {
  getAll() {
    return httpClient.get<MechanicSpecialtyDto[]>('/api/mechanic-specialties');
  },

  getByPersonId(personId: number) {
    return httpClient.get<MechanicSpecialtySummaryDto[]>(
      `/api/mechanics/${personId}/specialties`,
    );
  },

  replaceByPersonId(personId: number, body: ReplaceMechanicSpecialtiesRequest) {
    return httpClient.put<MechanicSpecialtySummaryDto[]>(
      `/api/mechanics/${personId}/specialties`,
      body,
    );
  },
};
