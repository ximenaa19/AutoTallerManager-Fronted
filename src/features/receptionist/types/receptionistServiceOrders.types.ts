export interface ServiceOrderSearchResultDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
}

export interface ReceptionistServiceOrderTableRow extends ServiceOrderSearchResultDto {
  vehiclePlate?: string;
  customerName?: string;
  customerDocumentNumber?: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
}

export interface ServiceOrderInventorySummaryDto {
  entryInventoryId: number;
  hasScratches: boolean;
  scratchesDescription?: string;
  hasToolbox: boolean;
  toolboxDescription?: string;
  ownershipCardDelivered: boolean;
  observations?: string;
  registeredAt: string;
}

export interface ServiceOrderFullServiceSummaryDto {
  orderServiceId: number;
  serviceTypeId: number;
  description?: string;
  workPerformed?: string;
  laborCost: number;
  customerApproved?: boolean;
  approvalDate?: string;
  parts?: ServiceOrderFullPartSummaryDto[];
}

export interface ServiceOrderFullPartSummaryDto {
  orderServicePartId: number;
  partId: number;
  quantity: number;
  appliedUnitPrice: number;
  subtotal: number;
  customerApproved?: boolean;
  approvalDate?: string;
}

export interface ServiceOrderFullDetailDto {
  serviceOrderId: number;
  vehicleId: number;
  vehiclePlate?: string;
  orderStatusId: number;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  createdAt: string;
  inventory?: ServiceOrderInventorySummaryDto;
  services: ServiceOrderFullServiceSummaryDto[];
}

export interface CreateWorkshopIntakeOrderServiceRequest {
  serviceTypeId: number;
  description?: string;
  laborCost: number;
}

export interface CreateWorkshopIntakeRequest {
  vehicleId: number;
  initialOrderStatusId?: number;
  entryDate?: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
  hasScratches: boolean;
  scratchesDescription?: string;
  hasToolbox: boolean;
  toolboxDescription?: string;
  ownershipCardDelivered: boolean;
  inventoryObservations?: string;
  services: CreateWorkshopIntakeOrderServiceRequest[];
}

export interface WorkshopIntakeResponseDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  entryInventoryId: number;
  orderStatusHistoryId: number;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
  services: {
    orderServiceId: number;
    serviceTypeId: number;
    description?: string;
    laborCost: number;
  }[];
}
