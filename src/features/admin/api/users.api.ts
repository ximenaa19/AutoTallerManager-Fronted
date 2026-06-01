import { httpClient } from '@/api/httpClient';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserDto,
} from '@/features/admin/types/users.types';
import type { StaffUserDto } from '@/features/admin/types/staff.types';

export const usersApi = {
  getAll() {
    return httpClient.get<UserDto[]>('/api/users');
  },

  getById(id: number) {
    return httpClient.get<UserDto>(`/api/users/${id}`);
  },

  create(body: CreateUserRequest) {
    return httpClient.post<UserDto>('/api/users', body);
  },

  update(id: number, body: UpdateUserRequest) {
    return httpClient.put<UserDto>(`/api/users/${id}`, body);
  },

  delete(id: number) {
    return httpClient.delete<void>(`/api/users/${id}`);
  },

  activate(id: number) {
    return httpClient.put<StaffUserDto>(`/api/users/${id}/activate`);
  },

  deactivate(id: number) {
    return httpClient.put<StaffUserDto>(`/api/users/${id}/deactivate`);
  },
};
