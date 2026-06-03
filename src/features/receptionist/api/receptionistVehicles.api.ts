import { httpClient } from '@/api/httpClient';
import type {
  AddVehicleToClientRequest,
  AddVehicleToClientResponse,
  VehicleDetailDto,
  VehicleSearchResultDto,
} from '@/features/receptionist/types/receptionistVehicles.types';

export const receptionistVehiclesApi = {
  searchVehicles(term: string) {
    return httpClient.get<VehicleSearchResultDto[]>('/api/search/vehicles', {
      params: { term },
    });
  },

  getVehicleById(vehicleId: number) {
    return httpClient.get<VehicleDetailDto>(`/api/vehicles/${vehicleId}`);
  },

  addVehicleToClient(personId: number, body: AddVehicleToClientRequest) {
    return httpClient.post<AddVehicleToClientResponse>(
      `/api/clients/${personId}/vehicles`,
      body,
    );
  },
};
