export interface ClientVehicleDto {
  vehicleId: number;
  modelId: number;
  vehicleTypeId: number;
  vin: string;
  plate: string;
  year: number;
  color?: string | null;
  mileage: number;
  isActive: boolean;
  ownershipStartDate?: string;
  ownershipEndDate?: string | null;
}

export interface ClientVehicleApiDto extends Omit<ClientVehicleDto, 'vin'> {
  vin?: string | null;
  VIN?: string | null;
}
