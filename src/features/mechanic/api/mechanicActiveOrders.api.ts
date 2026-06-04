import { httpClient } from '@/api/httpClient';
import type { MechanicActiveOrderDto } from '@/features/mechanic/types/mechanicActiveOrders.types';

export const mechanicActiveOrdersApi = {
  getMyActiveOrders() {
    return httpClient.get<MechanicActiveOrderDto[]>('/api/mechanic/my-active-orders');
  },
};
