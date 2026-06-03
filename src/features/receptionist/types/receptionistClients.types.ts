import type { CatalogItemDto } from '@/types/catalogs.types';

/** Aligned with api-contract §10 client onboarding and search DTOs. */
export interface ClientSearchResultDto {
  personId: number;
  documentNumber: string;
  fullName: string;
  primaryEmail?: string;
  primaryPhoneNumber?: string;
}

/** Aligned with api-contract §10 client onboarding request. */
export interface CreateClientWithVehicleRequest {
  documentTypeId: number;
  documentNumber?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondLastName?: string;
  birthDate?: string;
  genderId?: number;
  addressId?: number;
  email?: string;
  phoneCountryId?: number;
  phoneNumber?: string;
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin?: string;
  year: number;
  color?: string;
  mileage: number;
}

/** Aligned with api-contract §10 client onboarding and onboarding response. */
export interface ClientWithVehicleDto {
  personId: number;
  vehicleId: number;
  vehicleOwnerHistoryId: number;
  documentNumber: string;
  fullName: string;
  primaryEmail?: string;
  primaryPhoneNumber?: string;
  plate: string;
  vin: string;
}

/** Aligned with api-contract §10 client portal lists and ownership endpoints. */
export interface ClientVehicleDto {
  vehicleId: number;
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin: string;
  year: number;
  color?: string;
  mileage: number;
  isActive: boolean;
  ownershipStartDate: string;
  ownershipEndDate?: string;
}

export interface ClientServiceOrderSummaryDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  createdAt: string;
}

export interface ReceptionistPublicRegistrationCatalogsDto {
  documentTypes: CatalogItemDto[];
  genders: CatalogItemDto[];
  countries: CatalogItemDto[];
}

export interface ReceptionistWorkshopCatalogsDto {
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

export interface ReceptionistClientSearchPayload {
  term: string;
}
