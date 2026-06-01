import { httpClient } from '@/api/httpClient';
import type {
  RegisterStaffRequest,
  StaffUserDto,
} from '@/features/admin/types/staff.types';

export const staffApi = {
  register(body: RegisterStaffRequest) {
    return httpClient.post<StaffUserDto>('/api/staff/register', body);
  },
};
