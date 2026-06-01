import { httpClient } from '@/api/httpClient';
import type {
  AdjustStockRequest,
  InventoryAdjustmentResultDto,
  InventoryPurchaseResultDto,
  InventorySummaryDto,
  LowStockPartDto,
  RegisterInventoryPurchaseRequest,
} from '@/features/admin/inventory/types/inventory.types';

export const inventoryApi = {
  getSummary() {
    return httpClient.get<InventorySummaryDto>('/api/inventory/summary');
  },

  getLowStock() {
    return httpClient.get<LowStockPartDto[]>('/api/inventory/low-stock');
  },

  adjustStock(body: AdjustStockRequest) {
    return httpClient.post<InventoryAdjustmentResultDto>(
      '/api/inventory/adjust-stock',
      body,
    );
  },

  registerPurchase(body: RegisterInventoryPurchaseRequest) {
    return httpClient.post<InventoryPurchaseResultDto>(
      '/api/inventory/register-purchase',
      body,
    );
  },
};
