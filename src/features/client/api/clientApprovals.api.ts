import { httpClient } from '@/api/httpClient';
import type {
  ClientApprovalActionResultDto,
  ClientPendingApprovalDto,
} from '@/features/client/types/clientApprovals.types';

export const clientApprovalsApi = {
  getPendingApprovals() {
    return httpClient.get<ClientPendingApprovalDto[]>('/api/client/pending-approvals');
  },

  approveOrderService(orderServiceId: number) {
    return httpClient.post<ClientApprovalActionResultDto>(
      `/api/client/order-services/${orderServiceId}/approve`,
    );
  },

  rejectOrderService(orderServiceId: number) {
    return httpClient.post<ClientApprovalActionResultDto>(
      `/api/client/order-services/${orderServiceId}/reject`,
    );
  },

  approveOrderServicePart(orderServicePartId: number) {
    return httpClient.post<ClientApprovalActionResultDto>(
      `/api/client/order-service-parts/${orderServicePartId}/approve`,
    );
  },

  rejectOrderServicePart(orderServicePartId: number) {
    return httpClient.post<ClientApprovalActionResultDto>(
      `/api/client/order-service-parts/${orderServicePartId}/reject`,
    );
  },
};
