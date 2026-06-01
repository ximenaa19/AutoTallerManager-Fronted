import { httpClient } from '@/api/httpClient';
import type {
  AssignMechanicRequest,
  CreateOrderServiceRequest,
  OrderServiceDto,
  RequestPartRequest,
  ServiceExecutionResultDto,
  UnassignMechanicRequest,
  UpdateOrderServiceRequest,
  UpdateWorkReportRequest,
} from '@/features/admin/serviceOrders/types/orderServices.types';

export const orderServicesApi = {
  create(body: CreateOrderServiceRequest) {
    return httpClient.post<OrderServiceDto>('/api/order-services', body);
  },

  update(id: number, body: UpdateOrderServiceRequest) {
    return httpClient.put<OrderServiceDto>(`/api/order-services/${id}`, body);
  },

  delete(id: number) {
    return httpClient.delete<void>(`/api/order-services/${id}`);
  },

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
