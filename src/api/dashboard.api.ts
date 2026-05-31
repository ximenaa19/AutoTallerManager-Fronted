import { httpClient } from '@/api/httpClient';
import type {
  AdminDashboardDto,
  ClientDashboardDto,
  MechanicDashboardDto,
  ReceptionistDashboardDto,
} from '@/types/dashboard.types';

export const dashboardApi = {
  getAdminDashboard() {
    return httpClient.get<AdminDashboardDto>('/api/admin/dashboard');
  },

  getReceptionistDashboard() {
    return httpClient.get<ReceptionistDashboardDto>('/api/receptionist/dashboard');
  },

  getMechanicDashboard() {
    return httpClient.get<MechanicDashboardDto>('/api/mechanic/dashboard');
  },

  getClientDashboard() {
    return httpClient.get<ClientDashboardDto>('/api/client/dashboard');
  },
};
