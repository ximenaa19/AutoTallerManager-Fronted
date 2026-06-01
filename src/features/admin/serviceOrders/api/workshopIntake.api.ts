import { httpClient } from '@/api/httpClient';
import type {
  CreateWorkshopIntakeRequest,
  WorkshopCatalogsDto,
  WorkshopIntakeDto,
} from '@/features/admin/serviceOrders/types/workshopIntake.types';

export const workshopIntakeApi = {
  getWorkshopCatalogs() {
    return httpClient.get<WorkshopCatalogsDto>('/api/catalogs/workshop');
  },

  createServiceOrder(body: CreateWorkshopIntakeRequest) {
    return httpClient.post<WorkshopIntakeDto>(
      '/api/workshop-intake/create-service-order',
      body,
    );
  },
};
