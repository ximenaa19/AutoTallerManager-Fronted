import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { receptionistClientsApi } from '@/features/receptionist/api/receptionistClients.api';
import type { CatalogItemDto } from '@/types/catalogs.types';

export interface ReceptionistInvoiceLookups {
  invoiceStatusNameById: Map<number, string>;
  invoiceStatuses: CatalogItemDto[];
}

const EMPTY_LOOKUPS: ReceptionistInvoiceLookups = {
  invoiceStatusNameById: new Map(),
  invoiceStatuses: [],
};

export function useReceptionistInvoiceLookups() {
  const [lookups, setLookups] = useState<ReceptionistInvoiceLookups>(EMPTY_LOOKUPS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);

    receptionistClientsApi
      .getWorkshopCatalogs()
      .then((response) => {
        setLookups({
          invoiceStatusNameById: new Map(
            response.data.invoiceStatuses.map((status) => [status.id, status.name]),
          ),
          invoiceStatuses: response.data.invoiceStatuses,
        });
      })
      .catch((err) => {
        setLookups(EMPTY_LOOKUPS);
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { lookups, isLoading, error, retry: load };
}
