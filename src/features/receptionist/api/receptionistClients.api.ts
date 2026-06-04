import type {
  ClientSearchResultDto,
  CreateClientWithVehicleRequest,
  ClientWithVehicleDto,
  ClientVehicleDto,
  ClientServiceOrderSummaryDto,
  ReceptionistPublicRegistrationCatalogsDto,
  ReceptionistWorkshopCatalogsDto,
} from '@/features/receptionist/types/receptionistClients.types';
import { httpClient } from '@/api/httpClient';

export const receptionistClientsApi = {
  searchClients(term: string) {
    return httpClient.get<ClientSearchResultDto[]>('/api/search/clients', {
      params: { term },
    });
  },

  createClientWithVehicle(body: CreateClientWithVehicleRequest) {
    return httpClient.post<ClientWithVehicleDto>(
      '/api/receptionist/create-client-with-vehicle',
      body,
    );
  },

  getClientVehicles(personId: number) {
    return httpClient.get<ClientVehicleDto[]>(`/api/clients/${personId}/vehicles`);
  },

  getClientServiceOrders(personId: number) {
    return httpClient.get<ClientServiceOrderSummaryDto[]>(
      `/api/clients/${personId}/service-orders`,
    );
  },

  getPublicRegistrationCatalogs() {
    return httpClient.get<ReceptionistPublicRegistrationCatalogsDto>(
      '/api/catalogs/public-registration',
    );
  },

  getWorkshopCatalogs() {
    return httpClient.get<ReceptionistWorkshopCatalogsDto>('/api/catalogs/workshop');
  },
};
