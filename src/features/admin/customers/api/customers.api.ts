import { httpClient } from '@/api/httpClient';
import type {
  ClientSearchResultDto,
  ClientServiceOrderSummaryDto,
  ClientWithVehicleDto,
  CreateClientWithVehicleRequest,
} from '@/features/admin/customers/types/customers.types';
import type { ClientVehicleDto } from '@/features/admin/vehicles/types/vehicles.types';

export const customersApi = {
  searchClients(term: string) {
    return httpClient.get<ClientSearchResultDto[]>('/api/search/clients', {
      params: { term },
    });
  },

  getClientVehicles(personId: number) {
    return httpClient.get<ClientVehicleDto[]>(`/api/clients/${personId}/vehicles`);
  },

  getClientServiceOrders(personId: number) {
    return httpClient.get<ClientServiceOrderSummaryDto[]>(
      `/api/clients/${personId}/service-orders`,
    );
  },

  createClientWithVehicle(body: CreateClientWithVehicleRequest) {
    return httpClient.post<ClientWithVehicleDto>(
      '/api/receptionist/create-client-with-vehicle',
      body,
    );
  },
};
