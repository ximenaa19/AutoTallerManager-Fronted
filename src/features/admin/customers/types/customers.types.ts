/** Aligned with api-contract §10 Search results and client portal lists. */
export interface ClientSearchResultDto {
  personId: number;
  documentNumber: string;
  fullName: string;
  primaryEmail?: string;
  primaryPhoneNumber?: string;
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

/** Aligned with api-contract §10 Workshop / client onboarding. */
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
  vin?: string;
  year: number;
  color?: string;
  mileage: number;
}

export interface ClientWithVehicleDto {
  personId: number;
  vehicleId: number;
  vehicleOwnerHistoryId: number;
  documentNumber: string;
  fullName: string;
  primaryEmail?: string;
  primaryPhoneNumber?: string;
  vin: string;
}
