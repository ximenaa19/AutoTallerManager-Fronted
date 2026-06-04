import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { clientVehiclesApi } from '@/features/client/api/clientVehicles.api';
import type { ClientVehicleDto } from '@/features/client/types/clientVehicles.types';

export function useClientVehicles() {
  const [vehicles, setVehicles] = useState<ClientVehicleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientVehiclesApi.getMyVehicles();
      setVehicles(response.data);
    } catch (loadError) {
      setVehicles([]);
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVehicles();
  }, [loadVehicles]);

  return {
    vehicles,
    isLoading,
    error,
    retry: loadVehicles,
  };
}
