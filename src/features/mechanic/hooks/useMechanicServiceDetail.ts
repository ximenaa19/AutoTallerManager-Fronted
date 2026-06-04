import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { mechanicAssignmentsApi } from '@/features/mechanic/api/mechanicAssignments.api';
import { mechanicServiceOrderApi } from '@/features/mechanic/api/mechanicServiceOrder.api';
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
  const [requestedParts, setRequestedParts] = useState<
    MechanicServiceDetailState['requestedParts']
  >([]);
  const [fullDetailNotice, setFullDetailNotice] = useState<string | null>(null);
  const [isLoadingParts, setIsLoadingParts] = useState(false);

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

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!service) {
      setRequestedParts([]);
      setFullDetailNotice(null);
      setIsLoadingParts(false);
      return;
    }

    let cancelled = false;

    const serviceOrderId = service.serviceOrderId;

    async function loadFullDetail() {
      setIsLoadingParts(true);
      setFullDetailNotice(null);
      setRequestedParts([]);

      try {
        const response = await mechanicServiceOrderApi.getFullDetail(serviceOrderId);
        if (cancelled) {
          return;
        }

        const matchedService = response.data.services.find(
          (item) => item.orderServiceId === orderServiceId,
        );

        setRequestedParts(matchedService?.parts ?? []);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setFullDetailNotice(
          `Requested parts could not be loaded (${getErrorMessage(loadError)}). Assignment details below are still available.`,
        );
      } finally {
        if (!cancelled) {
          setIsLoadingParts(false);
        }
      }
    }

    void loadFullDetail();

    return () => {
      cancelled = true;
    };
  }, [orderServiceId, refreshKey, service]);

  const notFound = !isLoading && !error && isValidId && service === null;

  return {
    service,
    requestedParts,
    fullDetailNotice,
    isLoading,
    isLoadingParts,
    error,
    notFound,
    retry,
    refresh,
  };
}
