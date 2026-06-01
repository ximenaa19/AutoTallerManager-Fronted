import { httpClient } from '@/api/httpClient';
import type { ClientSearchResultDto } from '@/features/admin/customers/types/customers.types';
import type { ServiceOrderSearchResultDto } from '@/features/admin/serviceOrders/types/serviceOrders.types';
import type { VehicleSearchResultDto } from '@/features/admin/vehicles/types/vehicles.types';

export interface MechanicSearchResultDto {
  personId: number;
  documentNumber: string;
  fullName: string;
  specialtyIds: number[];
}

export interface PartSearchResultDto {
  partId: number;
  code: string;
  description: string;
  stock: number;
  minimumStock: number;
  unitPrice: number;
  isActive: boolean;
}

export const serviceOrderLookupsApi = {
  searchClients(term: string) {
    return httpClient.get<ClientSearchResultDto[]>('/api/search/clients', {
      params: { term },
    });
  },

  searchVehicles(term: string) {
    return httpClient.get<VehicleSearchResultDto[]>('/api/search/vehicles', {
      params: { term },
    });
  },

  searchServiceOrders(term: string) {
    return httpClient.get<ServiceOrderSearchResultDto[]>(
      '/api/search/service-orders',
      { params: { term } },
    );
  },

  searchMechanics(term: string) {
    return httpClient.get<MechanicSearchResultDto[]>('/api/search/mechanics', {
      params: { term },
    });
  },

  searchParts(term: string) {
    return httpClient.get<PartSearchResultDto[]>('/api/search/parts', {
      params: { term },
    });
  },
};
