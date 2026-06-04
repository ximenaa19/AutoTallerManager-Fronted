import { httpClient } from '@/api/httpClient';
import type {
  InventorySummaryDto,
  LowStockPartDto,
  PartSearchResultDto,
} from '@/features/receptionist/types/receptionistInventory.types';

export const receptionistInventoryApi = {
  getInventorySummary() {
    return httpClient.get<InventorySummaryDto>('/api/inventory/summary');
  },

  getLowStockParts() {
    return httpClient.get<LowStockPartDto[]>('/api/inventory/low-stock');
  },

  searchParts(term: string) {
    return httpClient.get<PartSearchResultDto[]>('/api/search/parts', {
      params: { term },
    });
  },
};
