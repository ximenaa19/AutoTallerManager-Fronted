export interface ClientPendingApprovalDto {
  serviceOrderId: number;
  vehicleId: number;
  vehiclePlate?: string | null;
  orderStatusId: number;
  entryDate: string;
  generalDescription?: string | null;
  pendingServices: ClientPendingServiceApprovalDto[];
  pendingParts: ClientPendingPartApprovalDto[];
}

export interface ClientPendingServiceApprovalDto {
  orderServiceId: number;
  serviceTypeId: number;
  serviceTypeName?: string | null;
  description?: string | null;
  laborCost: number;
  workPerformed?: string | null;
  customerApproved?: boolean | null;
  approvalDate?: string | null;
}

export interface ClientPendingPartApprovalDto {
  orderServicePartId: number;
  orderServiceId: number;
  partId: number;
  partName?: string | null;
  quantity: number;
  appliedUnitPrice: number;
  subtotal: number;
  customerApproved?: boolean | null;
  approvalDate?: string | null;
}

export interface ClientApprovalActionResultDto {
  id: number;
  type: 'service' | 'part';
  customerApproved: boolean;
  approvalDate: string;
  serviceOrderId: number;
}

export type ClientApprovalItemType = ClientApprovalActionResultDto['type'];
export type ClientApprovalDecision = 'approve' | 'reject';
