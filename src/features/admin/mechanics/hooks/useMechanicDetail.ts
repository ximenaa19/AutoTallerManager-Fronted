import { useCallback } from 'react';
import { mechanicsApi } from '@/features/admin/mechanics/api/mechanics.api';
import type {
  AdminMechanicDetailDto,
  AdminMechanicWorkloadDto,
} from '@/features/admin/mechanics/types/adminMechanics.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';

interface MechanicDetailData {
  detail: AdminMechanicDetailDto | null;
  workload: AdminMechanicWorkloadDto | null;
}

const emptyMechanicDetail: MechanicDetailData = { detail: null, workload: null };

export function useMechanicDetail(personId: number | null, refreshKey = 0) {
  const load = useCallback(async (): Promise<{ data: MechanicDetailData }> => {
    if (!personId) {
      return { data: emptyMechanicDetail };
    }

    const [detailResponse, workloadResponse] = await Promise.all([
      mechanicsApi.getByPersonId(personId),
      mechanicsApi.getWorkload(personId),
    ]);

    return {
      data: {
        detail: detailResponse.data,
        workload: workloadResponse.data,
      },
    };
  }, [personId]);

  const { data, isLoading, error, retry } = useAsyncRequest(load, [personId, refreshKey]);

  return {
    detail: data?.detail ?? null,
    workload: data?.workload ?? null,
    isLoading,
    error,
    retry,
  };
}
