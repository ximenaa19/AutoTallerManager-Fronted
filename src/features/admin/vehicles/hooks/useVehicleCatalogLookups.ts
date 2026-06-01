import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { httpClient } from '@/api/httpClient';
import type {
  VehicleBrandRecord,
  VehicleModelRecord,
  VehicleTypeRecord,
} from '@/features/admin/vehicles/types/vehicles.types';

export interface VehicleCatalogLookups {
  typeNameById: Map<number, string>;
  brandNameById: Map<number, string>;
  modelLabelById: Map<number, string>;
}

const emptyLookups: VehicleCatalogLookups = {
  typeNameById: new Map(),
  brandNameById: new Map(),
  modelLabelById: new Map(),
};

export function useVehicleCatalogLookups() {
  const [lookups, setLookups] = useState<VehicleCatalogLookups>(emptyLookups);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [typesResponse, brandsResponse, modelsResponse] = await Promise.all([
        httpClient.get<VehicleTypeRecord[]>('/api/vehicle-types'),
        httpClient.get<VehicleBrandRecord[]>('/api/vehicle-brands'),
        httpClient.get<VehicleModelRecord[]>('/api/vehicle-models'),
      ]);

      const brandNameById = new Map(
        brandsResponse.data.map((brand) => [brand.brandId, brand.brandName]),
      );

      const modelLabelById = new Map(
        modelsResponse.data.map((model) => {
          const brandName = brandNameById.get(model.brandId);
          const label = brandName
            ? `${brandName} ${model.modelName}`
            : model.modelName;
          return [model.modelId, label];
        }),
      );

      setLookups({
        typeNameById: new Map(
          typesResponse.data.map((type) => [type.vehicleTypeId, type.name]),
        ),
        brandNameById,
        modelLabelById,
      });
    } catch (err) {
      setLookups(emptyLookups);
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

export function formatVehicleModelLabel(
  modelId: number,
  lookups: VehicleCatalogLookups,
): string {
  return lookups.modelLabelById.get(modelId) ?? `Model #${modelId}`;
}

export function formatVehicleTypeLabel(
  vehicleTypeId: number,
  lookups: VehicleCatalogLookups,
): string {
  return lookups.typeNameById.get(vehicleTypeId) ?? `Type #${vehicleTypeId}`;
}
