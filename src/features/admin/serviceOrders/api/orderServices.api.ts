import { httpClient } from '@/api/httpClient';
import type {
  AssignMechanicRequest,
  RequestPartRequest,
  ServiceExecutionResultDto,
  UnassignMechanicRequest,
  UpdateWorkReportRequest,
} from '@/features/admin/serviceOrders/types/orderServices.types';

export const orderServicesApi = {
  assignMechanic(id: number, body: AssignMechanicRequest) {
    return httpClient.post<ServiceExecutionResultDto>(
      `/api/order-services/${id}/assign-mechanic`,
      body,
    );
  },

  unassignMechanic(id: number, body: UnassignMechanicRequest) {
    return httpClient.post<ServiceExecutionResultDto>(
      `/api/order-services/${id}/unassign-mechanic`,
      body,
    );
  },

  updateWorkReport(id: number, body: UpdateWorkReportRequest) {
    return httpClient.put<ServiceExecutionResultDto>(
      `/api/order-services/${id}/work-report`,
      body,
    );
  },

  requestPart(id: number, body: RequestPartRequest) {
    return httpClient.post<ServiceExecutionResultDto>(
      `/api/order-services/${id}/request-part`,
      body,
    );
  },
};
