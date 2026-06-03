export interface ClientServiceOrderSummaryDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  entryDate: string;
  estimatedDeliveryDate?: string | null;
  generalDescription?: string | null;
  cancellationReason?: string | null;
  cancellationDate?: string | null;
  createdAt: string;
}

export interface ClientServiceOrderFullDetailDto {
  serviceOrderId: number;
  vehicleId: number;
  vehiclePlate?: string | null;
  orderStatusId: number;
  entryDate: string;
  estimatedDeliveryDate?: string | null;
  generalDescription?: string | null;
  cancellationReason?: string | null;
  cancellationDate?: string | null;
  createdAt: string;
  inventory?: ClientServiceOrderInventorySummaryDto | null;
  services: ClientServiceOrderServiceSummaryDto[];
}

export interface ClientServiceOrderInventorySummaryDto {
  entryInventoryId: number;
  hasScratches: boolean;
  scratchesDescription?: string | null;
  hasToolbox: boolean;
  toolboxDescription?: string | null;
  ownershipCardDelivered: boolean;
  observations?: string | null;
  registeredAt: string;
}

export interface ClientServiceOrderServiceSummaryDto {
  orderServiceId: number;
  serviceTypeId: number;
  serviceTypeName?: string | null;
  description?: string | null;
  workPerformed?: string | null;
  laborCost: number;
  customerApproved?: boolean | null;
  approvalDate?: string | null;
  parts?: ClientServiceOrderPartSummaryDto[];
}

export interface ClientServiceOrderPartSummaryDto {
  orderServicePartId: number;
  partId: number;
  partName?: string | null;
  quantity: number;
  appliedUnitPrice: number;
  subtotal: number;
  customerApproved?: boolean | null;
  approvalDate?: string | null;
}
