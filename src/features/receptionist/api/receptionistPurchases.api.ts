import { httpClient } from '@/api/httpClient';
import type {
  RegisterPurchaseRequest,
  RegisterPurchaseResponseDto,
  SupplierSearchResultDto,
} from '@/features/receptionist/types/receptionistPurchases.types';
import type {
  InventorySummaryDto,
  LowStockPartDto,
} from '@/features/receptionist/types/receptionistInventory.types';
import type { PartSearchResultDto } from '@/features/receptionist/types/receptionistInventory.types';

export const receptionistPurchasesApi = {
  searchSuppliers(term: string) {
    return httpClient.get<SupplierSearchResultDto[]>('/api/search/suppliers', {
      params: { term },
    });
  },

  searchParts(term: string) {
    return httpClient.get<PartSearchResultDto[]>('/api/search/parts', {
      params: { term },
    });
  },

  registerPurchase(body: RegisterPurchaseRequest) {
    return httpClient.post<RegisterPurchaseResponseDto>(
      '/api/inventory/register-purchase',
      body,
    );
  },

  getInventorySummary() {
    return httpClient.get<InventorySummaryDto>('/api/inventory/summary');
  },

  getLowStockParts() {
    return httpClient.get<LowStockPartDto[]>('/api/inventory/low-stock');
  },
};
