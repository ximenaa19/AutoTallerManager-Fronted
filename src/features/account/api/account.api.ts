import { httpClient } from '@/api/httpClient';
import type {
  AccountProfileDto,
  ChangePasswordRequest,
  UpdateAccountProfileRequest,
} from '@/features/account/types/account.types';

export const accountApi = {
  getProfile() {
    return httpClient.get<AccountProfileDto>('/api/account/me');
  },

  updateProfile(body: UpdateAccountProfileRequest) {
    return httpClient.put<AccountProfileDto>('/api/account/me', body);
  },

  changePassword(body: ChangePasswordRequest) {
    return httpClient.post<void>('/api/account/change-password', body);
  },
};
