import { useCallback } from 'react';
import { mechanicActiveOrdersApi } from '@/features/mechanic/api/mechanicActiveOrders.api';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';

export function useMechanicActiveOrders() {
  const fetchActiveOrders = useCallback(
    () => mechanicActiveOrdersApi.getMyActiveOrders(),
    [],
  );

  return useAsyncRequest(fetchActiveOrders, []);
}
