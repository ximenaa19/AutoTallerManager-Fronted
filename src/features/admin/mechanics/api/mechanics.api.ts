import { httpClient } from '@/api/httpClient';
import type { OrderServiceDto } from '@/features/admin/serviceOrders/types/orderServices.types';
import type {
  MechanicAssignmentDto,
  MechanicSearchResultDto,
  MechanicSpecialtyAssignmentDto,
} from '@/features/admin/mechanics/types/mechanics.types';

export const mechanicsApi = {
  searchMechanics(term: string) {
    return httpClient.get<MechanicSearchResultDto[]>('/api/search/mechanics', {
      params: { term },
    });
  },

  getMechanicAssignments() {
    return httpClient.get<MechanicAssignmentDto[]>('/api/mechanic-assignments');
  },

  getMechanicSpecialtyAssignments() {
    return httpClient.get<MechanicSpecialtyAssignmentDto[]>(
      '/api/mechanic-specialty-assignments',
    );
  },

  getOrderServices() {
    return httpClient.get<OrderServiceDto[]>('/api/order-services');
  },
};
