import { httpClient } from '@/api/httpClient';
import type { PersonDto } from '@/features/admin/types/persons.types';
import type {
  CreatePersonRequest,
  UpdatePersonRequest,
} from '@/features/admin/customers/types/persons.types';

export const personsAdminApi = {
  getAll() {
    return httpClient.get<PersonDto[]>('/api/persons');
  },

  getById(id: number) {
    return httpClient.get<PersonDto>(`/api/persons/${id}`);
  },

  create(body: CreatePersonRequest) {
    return httpClient.post<PersonDto>('/api/persons', body);
  },

  update(id: number, body: UpdatePersonRequest) {
    return httpClient.put<PersonDto>(`/api/persons/${id}`, body);
  },

  delete(id: number) {
    return httpClient.delete<void>(`/api/persons/${id}`);
  },
};
