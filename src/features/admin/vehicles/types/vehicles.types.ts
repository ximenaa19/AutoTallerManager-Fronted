/** Response fields aligned with api-contract §7 Vehicle entity and §10 search/client DTOs. */
export interface VehicleDto {
  vehicleId: number;
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin: string;
  year: number;
  color?: string;
  mileage: number;
  isActive: boolean;
  createdAt?: string;
}

export interface VehicleSearchResultDto {
  vehicleId: number;
  plate: string;
  vin: string;
  modelId: number;
  vehicleTypeId: number;
  year: number;
  color?: string;
  isActive: boolean;
}

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

export interface TransferVehicleOwnershipRequest {
  newOwnerPersonId: number;
  transferDate?: string;
}

export interface CreateVehicleRequest {
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin: string;
  year: number;
  color?: string;
  mileage: number;
  isActive: boolean;
}

export interface UpdateVehicleRequest {
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin: string;
  year: number;
  color?: string;
  mileage: number;
  isActive: boolean;
}

export interface AddVehicleToClientRequest {
  modelId: number;
  vehicleTypeId: number;
  plate: string;
  vin?: string;
  year: number;
  color?: string;
  mileage: number;
}

export interface VehicleBrandRecord {
  brandId: number;
  brandName: string;
}

export interface VehicleModelRecord {
  modelId: number;
  brandId: number;
  modelName: string;
}

export interface VehicleTypeRecord {
  vehicleTypeId: number;
  name: string;
}

export function vehicleMatchesSearch(vehicle: VehicleDto, term: string): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;

  return [
    vehicle.plate,
    vehicle.vin,
    String(vehicle.vehicleId),
    String(vehicle.modelId),
    String(vehicle.vehicleTypeId),
    String(vehicle.year),
    vehicle.color,
    vehicle.isActive ? 'active' : 'inactive',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(normalized);
}
