export interface InventorySummaryDto {
  totalParts: number;
  activeParts: number;
  lowStockParts: number;
  outOfStockParts: number;
  estimatedInventoryValue: number;
}

export interface LowStockPartDto {
  partId: number;
  partCategoryId: number;
  partBrandId?: number | null;
  code: string;
  description: string;
  stock: number;
  minimumStock: number;
  unitPrice: number;
  isActive: boolean;
}

export interface AdjustStockRequest {
  partId: number;
  adjustmentQuantity: number;
  reason?: string;
}

export interface InventoryAdjustmentResultDto {
  partId: number;
  previousStock: number;
  adjustmentQuantity: number;
  newStock: number;
  reason?: string;
}

export interface RegisterInventoryPurchaseDetailRequest {
  partId: number;
  quantity: number;
  unitPrice: number;
}

export interface RegisterInventoryPurchaseRequest {
  supplierId: number;
  purchaseDate?: string;
  details: RegisterInventoryPurchaseDetailRequest[];
}

export interface InventoryPurchaseDetailResultDto {
  partPurchaseDetailId: number;
  partId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InventoryPurchaseResultDto {
  partPurchaseId: number;
  supplierId: number;
  purchaseDate: string;
  total: number;
  details: InventoryPurchaseDetailResultDto[];
}

export type StockLevel = 'ok' | 'low' | 'out';

export function getStockLevel(
  stock: number,
  minimumStock: number,
): StockLevel {
  if (stock <= 0) return 'out';
  if (stock <= minimumStock) return 'low';
  return 'ok';
}
