import { httpClient } from '@/api/httpClient';
import type {
  CreatePersonRoleRequest,
  PersonRoleDto,
  UpdatePersonRoleRequest,
} from '@/features/admin/types/personRoles.types';

export const personRolesApi = {
  getAll() {
    return httpClient.get<PersonRoleDto[]>('/api/person-roles');
  },

  getById(id: number) {
    return httpClient.get<PersonRoleDto>(`/api/person-roles/${id}`);
  },

  create(body: CreatePersonRoleRequest) {
    return httpClient.post<PersonRoleDto>('/api/person-roles', body);
  },

  update(id: number, body: UpdatePersonRoleRequest) {
    return httpClient.put<PersonRoleDto>(`/api/person-roles/${id}`, body);
  },

  delete(id: number) {
    return httpClient.delete<void>(`/api/person-roles/${id}`);
  },
};
