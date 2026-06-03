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

export interface PartSearchResultDto {
  partId: number;
  code: string;
  description: string;
  stock: number;
  minimumStock: number;
  unitPrice: number;
  isActive: boolean;
}
