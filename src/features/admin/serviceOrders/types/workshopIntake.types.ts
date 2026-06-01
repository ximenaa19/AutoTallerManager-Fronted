import type { CatalogItemDto } from '@/types/catalogs.types';

/** Types aligned with api-contract.md §10 Workshop intake. */

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

export interface WorkshopIntakeDto {
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

export interface WorkshopCatalogsDto {
  vehicleTypes: CatalogItemDto[];
  vehicleBrands: CatalogItemDto[];
  vehicleModels: CatalogItemDto[];
  serviceTypes: CatalogItemDto[];
  orderStatuses: CatalogItemDto[];
  invoiceStatuses: CatalogItemDto[];
  paymentMethods: CatalogItemDto[];
  paymentStatuses: CatalogItemDto[];
  cardTypes: CatalogItemDto[];
  mechanicSpecialties: CatalogItemDto[];
  partCategories: CatalogItemDto[];
  partBrands: CatalogItemDto[];
  auditActionTypes: CatalogItemDto[];
}
