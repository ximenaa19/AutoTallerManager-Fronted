import { httpClient } from '@/api/httpClient';
import type {
  CreateRoleRequest,
  RoleDto,
  UpdateRoleRequest,
} from '@/features/admin/types/roles.types';

export const rolesApi = {
  getAll() {
    return httpClient.get<RoleDto[]>('/api/roles');
  },

  getById(id: number) {
    return httpClient.get<RoleDto>(`/api/roles/${id}`);
  },

  create(body: CreateRoleRequest) {
    return httpClient.post<RoleDto>('/api/roles', body);
  },

  update(id: number, body: UpdateRoleRequest) {
    return httpClient.put<RoleDto>(`/api/roles/${id}`, body);
  },

  delete(id: number) {
    return httpClient.delete<void>(`/api/roles/${id}`);
  },
};
