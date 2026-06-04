import { httpClient } from '@/api/httpClient';
import type { ServiceOrderFullDetailDto } from '@/features/admin/serviceOrders/types/serviceOrders.types';
import type { ServiceExecutionResultDto } from '@/features/mechanic/types/mechanicPartRequests.types';

export interface ChangeOrderServicePartQuantityRequest {
  quantity: number;
}

export const mechanicServiceOrderApi = {
  getFullDetail(serviceOrderId: number) {
    return httpClient.get<ServiceOrderFullDetailDto>(
      `/api/service-orders/${serviceOrderId}/full-detail`,
    );
  },

  changePartQuantity(orderServicePartId: number, body: ChangeOrderServicePartQuantityRequest) {
    return httpClient.put<ServiceExecutionResultDto>(
      `/api/order-service-parts/${orderServicePartId}/change-quantity`,
      body,
    );
  },
};
