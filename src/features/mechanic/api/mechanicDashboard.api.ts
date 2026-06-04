import { httpClient } from '@/api/httpClient';
import type { MechanicDashboardDto } from '@/features/mechanic/types/mechanicDashboard.types';

export const mechanicDashboardApi = {
  getDashboard() {
    return httpClient.get<MechanicDashboardDto>('/api/mechanic/dashboard');
  },
};
