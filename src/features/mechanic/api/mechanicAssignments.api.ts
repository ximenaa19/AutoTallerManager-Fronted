import { httpClient } from '@/api/httpClient';
import type { MechanicAssignedServiceDto } from '@/features/mechanic/types/mechanicAssignments.types';

export const mechanicAssignmentsApi = {
  getMyAssignedServices() {
    return httpClient.get<MechanicAssignedServiceDto[]>('/api/mechanic/my-assigned-services');
  },
};
