/** Confirmed fields from `PartSearchResultDto` (GET `/api/search/parts`). */
export interface PartSearchResultDto {
  partId: number;
  code: string;
  description: string;
  stock: number;
  minimumStock: number;
  unitPrice: number;
  isActive: boolean;
}
