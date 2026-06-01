import { httpClient } from '@/api/httpClient';
import type { CatalogDefinition } from '@/features/admin/catalogs/config/catalogDefinitions';
import type { CatalogRecord } from '@/features/admin/catalogs/types/catalogs.types';

export const catalogsAdminApi = {
  getAll(definition: CatalogDefinition) {
    return httpClient.get<CatalogRecord[]>(definition.apiPath);
  },

  getById(definition: CatalogDefinition, id: number) {
    return httpClient.get<CatalogRecord>(`${definition.apiPath}/${id}`);
  },

  create(definition: CatalogDefinition, body: Record<string, unknown>) {
    return httpClient.post<CatalogRecord>(definition.apiPath, body);
  },

  update(definition: CatalogDefinition, id: number, body: Record<string, unknown>) {
    return httpClient.put<CatalogRecord>(`${definition.apiPath}/${id}`, body);
  },

  delete(definition: CatalogDefinition, id: number) {
    return httpClient.delete<void>(`${definition.apiPath}/${id}`);
  },
};
