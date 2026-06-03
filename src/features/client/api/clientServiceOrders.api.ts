import { httpClient } from '@/api/httpClient';
import type {
  ClientServiceOrderFullDetailDto,
  ClientServiceOrderSummaryDto,
} from '@/features/client/types/clientServiceOrders.types';

export const clientServiceOrdersApi = {
  getMyServiceOrders() {
    return httpClient.get<ClientServiceOrderSummaryDto[]>('/api/client/my-service-orders');
  },

  getServiceOrderFullDetail(serviceOrderId: number) {
    return httpClient.get<ClientServiceOrderFullDetailDto>(
      `/api/service-orders/${serviceOrderId}/full-detail`,
    );
  },
};
