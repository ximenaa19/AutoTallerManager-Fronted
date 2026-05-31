import { httpClient } from '@/api/httpClient';
import type { PublicRegistrationCatalogsDto } from '@/types/catalogs.types';

export const catalogsApi = {
  getPublicRegistration() {
    return httpClient.get<PublicRegistrationCatalogsDto>(
      '/api/catalogs/public-registration',
      { skipAuth: true },
    );
  },
};
