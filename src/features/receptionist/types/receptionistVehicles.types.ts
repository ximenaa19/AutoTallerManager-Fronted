/** Request aligned with receptionist add-vehicle flow in api-contract. */
export interface AddVehicleToClientRequest {
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin?: string;
  year: number;
  color?: string;
  mileage: number;
}

/** Response for POST /api/clients/{personId}/vehicles. */
export interface AddVehicleToClientResponse {
  vehicleId: number;
  modelId: number;
  vehicleTypeId: number;
  plate?: string;
  vin: string;
  year: number;
  color?: string;
  mileage: number;
  isActive: boolean;
  ownershipStartDate?: string;
}

/** Search DTO for /api/search/vehicles. */
export interface VehicleSearchResultDto {
  vehicleId: number;
  vin: string;
  modelId: number;
  vehicleTypeId: number;
  plate?: string;
  year: number;
  color?: string;
  isActive: boolean;
}

/** Vehicle lookup by id for optional detail panel. */
export interface VehicleDetailDto {
  vehicleId: number;
  modelId: number;
  vehicleTypeId: number;
  plate?: string;
  vin: string;
  year: number;
  color?: string;
  mileage: number;
  isActive: boolean;
  createdAt?: string;
}
