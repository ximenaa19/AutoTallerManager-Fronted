import { httpClient } from '@/api/httpClient';
import type { PersonDto } from '@/features/admin/types/persons.types';

/** Read-only lookup for admin user account linking. Not a full Persons CRUD module. */
export const personsApi = {
  getAll() {
    return httpClient.get<PersonDto[]>('/api/persons');
  },
};
