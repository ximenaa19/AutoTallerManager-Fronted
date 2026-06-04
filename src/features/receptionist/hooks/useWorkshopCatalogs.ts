import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { receptionistClientsApi } from '@/features/receptionist/api/receptionistClients.api';
import type { ReceptionistWorkshopCatalogsDto } from '@/features/receptionist/types/receptionistClients.types';

export interface ReceptionistWorkshopCatalogLookups {
  serviceTypeNameById: Map<number, string>;
  orderStatusNameById: Map<number, string>;
  serviceTypes: ReceptionistWorkshopCatalogsDto['serviceTypes'];
  orderStatuses: ReceptionistWorkshopCatalogsDto['orderStatuses'];
  orderStatusIds: number[];
}

function toNameMap(items: { id: number; name: string }[]): Map<number, string> {
  return new Map(items.map((item) => [item.id, item.name]));
}

const EMPTY_LOOKUPS: ReceptionistWorkshopCatalogLookups = {
  serviceTypeNameById: new Map(),
  orderStatusNameById: new Map(),
  serviceTypes: [],
  orderStatuses: [],
  orderStatusIds: [],
};

export function useWorkshopCatalogs() {
  const [lookups, setLookups] =
    useState<ReceptionistWorkshopCatalogLookups>(EMPTY_LOOKUPS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await receptionistClientsApi.getWorkshopCatalogs();
      const data = response.data;

      setLookups({
        serviceTypeNameById: toNameMap(data.serviceTypes),
        orderStatusNameById: toNameMap(data.orderStatuses),
        serviceTypes: data.serviceTypes,
        orderStatuses: data.orderStatuses,
        orderStatusIds: data.orderStatuses.map((status) => status.id),
      });
    } catch (err) {
      setLookups(EMPTY_LOOKUPS);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { lookups, isLoading, error, retry: load };
}
