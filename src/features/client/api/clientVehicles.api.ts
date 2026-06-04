import { httpClient } from '@/api/httpClient';
import type {
  ClientVehicleApiDto,
  ClientVehicleDto,
} from '@/features/client/types/clientVehicles.types';

function normalizeClientVehicle(vehicle: ClientVehicleApiDto): ClientVehicleDto {
  return {
    vehicleId: vehicle.vehicleId,
    modelId: vehicle.modelId,
    vehicleTypeId: vehicle.vehicleTypeId,
    vin: vehicle.vin ?? vehicle.VIN ?? '',
    plate: vehicle.plate,
    year: vehicle.year,
    color: vehicle.color,
    mileage: vehicle.mileage,
    isActive: vehicle.isActive,
    ownershipStartDate: vehicle.ownershipStartDate,
    ownershipEndDate: vehicle.ownershipEndDate,
  };
}

export const clientVehiclesApi = {
  async getMyVehicles() {
    const response = await httpClient.get<ClientVehicleApiDto[]>('/api/client/my-vehicles');

    return {
      ...response,
      data: response.data.map(normalizeClientVehicle),
    };
  },
};
