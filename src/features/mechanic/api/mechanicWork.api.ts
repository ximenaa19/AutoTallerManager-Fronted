import { httpClient } from '@/api/httpClient';
import type {
  ServiceExecutionResultDto,
  UpdateWorkPerformedRequest,
} from '@/features/mechanic/types/mechanicWork.types';

export const mechanicWorkApi = {
  updateWorkPerformed(orderServiceId: number, body: UpdateWorkPerformedRequest) {
    return httpClient.put<ServiceExecutionResultDto>(
      `/api/mechanic/order-services/${orderServiceId}/work-performed`,
      body,
    );
  },
};
