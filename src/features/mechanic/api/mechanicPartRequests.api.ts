import { httpClient } from '@/api/httpClient';
import type {
  RequestPartRequest,
  ServiceExecutionResultDto,
} from '@/features/mechanic/types/mechanicPartRequests.types';

export const mechanicPartRequestsApi = {
  requestPart(orderServiceId: number, body: RequestPartRequest) {
    return httpClient.post<ServiceExecutionResultDto>(
      `/api/order-services/${orderServiceId}/request-part`,
      body,
    );
  },
};
