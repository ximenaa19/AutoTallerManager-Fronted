import { httpClient } from '@/api/httpClient';
import type {
  ClientVehicleDto,
  CreateVehicleRequest,
  TransferVehicleOwnershipRequest,
  UpdateVehicleRequest,
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

  create(body: CreateVehicleRequest) {
    return httpClient.post<VehicleDto>('/api/vehicles', body);
  },

  update(id: number, body: UpdateVehicleRequest) {
    return httpClient.put<VehicleDto>(`/api/vehicles/${id}`, body);
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
