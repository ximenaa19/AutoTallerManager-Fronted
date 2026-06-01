import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { workshopIntakeApi } from '@/features/admin/serviceOrders/api/workshopIntake.api';
import type { WorkshopCatalogsDto } from '@/features/admin/serviceOrders/types/workshopIntake.types';

export interface WorkshopCatalogLookups {
  serviceTypeNameById: Map<number, string>;
  orderStatusNameById: Map<number, string>;
  specialtyNameById: Map<number, string>;
  vehicleTypeNameById: Map<number, string>;
  vehicleBrandNameById: Map<number, string>;
  vehicleModelNameById: Map<number, string>;
  orderStatuses: WorkshopCatalogsDto['orderStatuses'];
  serviceTypes: WorkshopCatalogsDto['serviceTypes'];
  mechanicSpecialties: WorkshopCatalogsDto['mechanicSpecialties'];
}

const emptyLookups: WorkshopCatalogLookups = {
  serviceTypeNameById: new Map(),
  orderStatusNameById: new Map(),
  specialtyNameById: new Map(),
  vehicleTypeNameById: new Map(),
  vehicleBrandNameById: new Map(),
  vehicleModelNameById: new Map(),
  orderStatuses: [],
  serviceTypes: [],
  mechanicSpecialties: [],
};

function toNameMap(items: { id: number; name: string }[]): Map<number, string> {
  return new Map(items.map((item) => [item.id, item.name]));
}

export function useWorkshopCatalogLookups() {
  const [lookups, setLookups] = useState<WorkshopCatalogLookups>(emptyLookups);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await workshopIntakeApi.getWorkshopCatalogs();
      const data = response.data;

      setLookups({
        serviceTypeNameById: toNameMap(data.serviceTypes),
        orderStatusNameById: toNameMap(data.orderStatuses),
        specialtyNameById: toNameMap(data.mechanicSpecialties),
        vehicleTypeNameById: toNameMap(data.vehicleTypes),
        vehicleBrandNameById: toNameMap(data.vehicleBrands),
        vehicleModelNameById: toNameMap(data.vehicleModels),
        orderStatuses: data.orderStatuses,
        serviceTypes: data.serviceTypes,
        mechanicSpecialties: data.mechanicSpecialties,
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

export function formatServiceTypeLabel(
  serviceTypeId: number,
  lookups: WorkshopCatalogLookups,
): string {
  return lookups.serviceTypeNameById.get(serviceTypeId) ?? `Service #${serviceTypeId}`;
}

export function formatSpecialtyLabel(
  specialtyId: number,
  lookups: WorkshopCatalogLookups,
): string {
  return lookups.specialtyNameById.get(specialtyId) ?? `Specialty #${specialtyId}`;
}
