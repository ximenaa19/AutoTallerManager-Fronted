import { httpClient } from '@/api/httpClient';
import type {
  ClientVehicleDto,
  TransferVehicleOwnershipRequest,
  VehicleDto,
  VehicleSearchResultDto,
} from '@/features/admin/vehicles/types/vehicles.types';

export const vehiclesApi = {
  getAll() {
    return httpClient.get<VehicleDto[]>('/api/vehicles');
  },

  getById(id: number) {
    return httpClient.get<VehicleDto>(`/api/vehicles/${id}`);
  },

  delete(id: number) {
    return httpClient.delete<void>(`/api/vehicles/${id}`);
  },

  search(term: string) {
    return httpClient.get<VehicleSearchResultDto[]>('/api/search/vehicles', {
      params: { term },
    });
  },

  transferOwnership(vehicleId: number, body: TransferVehicleOwnershipRequest) {
    return httpClient.post<ClientVehicleDto>(
      `/api/vehicles/${vehicleId}/transfer-ownership`,
      body,
    );
  },
};
