import { httpClient } from '@/api/httpClient';
import type {
  CancelServiceOrderRequest,
  ChangeServiceOrderStatusRequest,
  ServiceOrderDto,
  ServiceOrderFullDetailDto,
  ServiceOrderWorkflowDto,
  UpdateServiceOrderRequest,
  VoidServiceOrderRequest,
} from '@/features/admin/serviceOrders/types/serviceOrders.types';

export const serviceOrdersApi = {
  getAll() {
    return httpClient.get<ServiceOrderDto[]>('/api/service-orders');
  },

  getById(id: number) {
    return httpClient.get<ServiceOrderDto>(`/api/service-orders/${id}`);
  },

  getFullDetail(id: number) {
    return httpClient.get<ServiceOrderFullDetailDto>(
      `/api/service-orders/${id}/full-detail`,
    );
  },

  update(id: number, body: UpdateServiceOrderRequest) {
    return httpClient.put<ServiceOrderDto>(`/api/service-orders/${id}`, body);
  },

  changeStatus(id: number, body: ChangeServiceOrderStatusRequest) {
    return httpClient.post<ServiceOrderWorkflowDto>(
      `/api/service-orders/${id}/change-status`,
      body,
    );
  },

  cancel(id: number, body: CancelServiceOrderRequest) {
    return httpClient.post<ServiceOrderWorkflowDto>(
      `/api/service-orders/${id}/cancel`,
      body,
    );
  },

  void(id: number, body: VoidServiceOrderRequest) {
    return httpClient.post<ServiceOrderWorkflowDto>(
      `/api/service-orders/${id}/void`,
      body,
    );
  },

  complete(id: number) {
    return httpClient.post<ServiceOrderWorkflowDto>(
      `/api/service-orders/${id}/complete`,
    );
  },
};
