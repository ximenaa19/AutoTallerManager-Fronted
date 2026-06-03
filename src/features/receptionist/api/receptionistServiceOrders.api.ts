import { httpClient } from '@/api/httpClient';
import type {
  CreateWorkshopIntakeRequest,
  ServiceOrderFullDetailDto,
  ServiceOrderSearchResultDto,
  WorkshopIntakeResponseDto,
} from '@/features/receptionist/types/receptionistServiceOrders.types';

export const receptionistServiceOrdersApi = {
  searchServiceOrders(term: string) {
    return httpClient.get<ServiceOrderSearchResultDto[]>(
      '/api/search/service-orders',
      {
        params: { term },
      },
    );
  },

  getServiceOrderFullDetail(serviceOrderId: number) {
    return httpClient.get<ServiceOrderFullDetailDto>(
      `/api/service-orders/${serviceOrderId}/full-detail`,
    );
  },

  createServiceOrderIntake(body: CreateWorkshopIntakeRequest) {
    return httpClient.post<WorkshopIntakeResponseDto>(
      '/api/workshop-intake/create-service-order',
      body,
    );
  },
};
