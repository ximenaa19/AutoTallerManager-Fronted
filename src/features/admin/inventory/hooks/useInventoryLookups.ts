import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { httpClient } from '@/api/httpClient';
import { suppliersApi } from '@/features/admin/inventory/api/suppliers.api';
import type { PartDto } from '@/features/admin/inventory/types/parts.types';
import type {
  PartBrandRecord,
  PartCategoryRecord,
} from '@/features/admin/inventory/types/parts.types';
import type { SupplierDto } from '@/features/admin/inventory/types/suppliers.types';
import { getPartDisplayLines } from '@/features/admin/inventory/utils/partDisplay';

export interface InventoryLookups {
  categoryNameById: Map<number, string>;
  brandNameById: Map<number, string>;
  supplierNameById: Map<number, string>;
  partLabelById: Map<number, string>;
  categories: PartCategoryRecord[];
  brands: PartBrandRecord[];
  suppliers: SupplierDto[];
}

const emptyLookups: InventoryLookups = {
  categoryNameById: new Map(),
  brandNameById: new Map(),
  supplierNameById: new Map(),
  partLabelById: new Map(),
  categories: [],
  brands: [],
  suppliers: [],
};

export function useInventoryLookups(options?: { loadParts?: boolean }) {
  const loadParts = options?.loadParts ?? false;
  const [lookups, setLookups] = useState<InventoryLookups>(emptyLookups);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const requests: [
        Promise<{ data: PartCategoryRecord[] }>,
        Promise<{ data: PartBrandRecord[] }>,
        Promise<{ data: SupplierDto[] }>,
        Promise<{ data: PartDto[] }> | null,
      ] = [
        httpClient.get<PartCategoryRecord[]>('/api/part-categories'),
        httpClient.get<PartBrandRecord[]>('/api/part-brands'),
        suppliersApi.getAll(),
        loadParts ? httpClient.get<PartDto[]>('/api/parts') : null,
      ];

      const [categoriesResponse, brandsResponse, suppliersResponse, partsResponse] =
        await Promise.all([
          requests[0],
          requests[1],
          requests[2],
          loadParts ? requests[3] : Promise.resolve(null),
        ]);

      const partLabelById = new Map<number, string>();
      if (partsResponse) {
        for (const part of partsResponse.data) {
          partLabelById.set(part.partId, getPartDisplayLines(part).compact);
        }
      }

      setLookups({
        categoryNameById: new Map(
          categoriesResponse.data.map((category) => [
            category.partCategoryId,
            category.name,
          ]),
        ),
        brandNameById: new Map(
          brandsResponse.data.map((brand) => [brand.partBrandId, brand.name]),
        ),
        supplierNameById: new Map(
          suppliersResponse.data.map((supplier) => [
            supplier.supplierId,
            supplier.name,
          ]),
        ),
        partLabelById,
        categories: categoriesResponse.data,
        brands: brandsResponse.data,
        suppliers: suppliersResponse.data,
      });
    } catch (err) {
      setLookups(emptyLookups);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [loadParts]);

  useEffect(() => {
    void load();
  }, [load]);

  return { lookups, isLoading, error, retry: load };
}

export function formatPartCategoryLabel(
  partCategoryId: number,
  lookups: InventoryLookups,
): string {
  return lookups.categoryNameById.get(partCategoryId) ?? `Category #${partCategoryId}`;
}

export function formatPartBrandLabel(
  partBrandId: number | null | undefined,
  lookups: InventoryLookups,
): string {
  if (!partBrandId) return '—';
  return lookups.brandNameById.get(partBrandId) ?? `Brand #${partBrandId}`;
}

export function formatSupplierLabel(
  supplierId: number,
  lookups: InventoryLookups,
): string {
  return lookups.supplierNameById.get(supplierId) ?? `Supplier #${supplierId}`;
}

export function formatPartLabel(
  partId: number,
  lookups: InventoryLookups,
): string {
  return lookups.partLabelById.get(partId) ?? `Part #${partId}`;
}
