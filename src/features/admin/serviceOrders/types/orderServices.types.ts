/** Types aligned with api-contract.md §10 Order services. */

export interface OrderServiceDto {
  orderServiceId: number;
  serviceOrderId: number;
  serviceTypeId: number;
  description?: string;
  workPerformed?: string;
  laborCost: number;
  customerApproved?: boolean;
  approvalDate?: string;
}

export interface CreateOrderServiceRequest {
  serviceOrderId: number;
  serviceTypeId: number;
  description?: string;
  workPerformed?: string;
  laborCost: number;
  customerApproved?: boolean;
  approvalDate?: string;
}

export interface UpdateOrderServiceRequest {
  serviceOrderId: number;
  serviceTypeId: number;
  description?: string;
  workPerformed?: string;
  laborCost: number;
  customerApproved?: boolean;
  approvalDate?: string;
}

export interface ServiceExecutionResultDto {
  id: number;
  entity: string;
  action: string;
  success: boolean;
}

export interface AssignMechanicRequest {
  mechanicPersonId: number;
  specialtyId: number;
}

export interface UnassignMechanicRequest {
  mechanicAssignmentId: number;
}

export interface UpdateWorkReportRequest {
  workPerformed?: string;
  laborCost?: number;
}

export interface RequestPartRequest {
  partId: number;
  quantity: number;
  appliedUnitPrice: number;
}
