import { useCallback } from 'react';
import { mechanicAssignmentsApi } from '@/features/mechanic/api/mechanicAssignments.api';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';

export function useMechanicAssignments() {
  const fetchAssignments = useCallback(
    () => mechanicAssignmentsApi.getMyAssignedServices(),
    [],
  );

  return useAsyncRequest(fetchAssignments, []);
}
