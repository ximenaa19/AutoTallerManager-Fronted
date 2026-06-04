import { useCallback } from 'react';
import { mechanicDashboardApi } from '@/features/mechanic/api/mechanicDashboard.api';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';

export function useMechanicDashboard() {
  const fetchDashboard = useCallback(() => mechanicDashboardApi.getDashboard(), []);

  return useAsyncRequest(fetchDashboard, []);
}
