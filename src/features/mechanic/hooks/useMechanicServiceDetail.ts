import { useCallback, useMemo, useState } from 'react';
import { mechanicAssignmentsApi } from '@/features/mechanic/api/mechanicAssignments.api';
import type { MechanicAssignedServiceDto } from '@/features/mechanic/types/mechanicAssignments.types';
import type { MechanicServiceDetailState } from '@/features/mechanic/types/mechanicWork.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';

function findAssignedService(
  assignments: MechanicAssignedServiceDto[],
  orderServiceId: number,
): MechanicAssignedServiceDto | null {
  return (
    assignments.find((item) => item.orderServiceId === orderServiceId) ?? null
  );
}

export function useMechanicServiceDetail(
  orderServiceId: number,
  isValidId: boolean,
): MechanicServiceDetailState {
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAssignments = useCallback(() => {
    if (!isValidId) {
      return Promise.reject(new Error('Invalid order service ID'));
    }
    return mechanicAssignmentsApi.getMyAssignedServices();
  }, [isValidId]);

  const { data, isLoading, error, retry } = useAsyncRequest(fetchAssignments, [
    orderServiceId,
    refreshKey,
  ]);

  const assignments = useMemo(() => data ?? [], [data]);

  const service = useMemo(() => {
    if (!isValidId) {
      return null;
    }
    return findAssignedService(assignments, orderServiceId);
  }, [assignments, isValidId, orderServiceId]);

  const notFound = !isLoading && !error && isValidId && service === null;

  return {
    service,
    isLoading,
    error,
    notFound,
    retry,
    refresh: () => setRefreshKey((value) => value + 1),
  };
}
