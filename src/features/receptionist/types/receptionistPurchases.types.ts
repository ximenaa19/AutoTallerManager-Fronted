export interface SupplierSearchResultDto {
  supplierId: number;
  name: string;
  taxId?: string;
  phone?: string;
  email?: string;
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

export interface RegisterPurchaseDetailRequest {
  partId: number;
  quantity: number;
  unitPrice: number;
}

export interface RegisterPurchaseRequest {
  supplierId: number;
  purchaseDate?: string;
  details?: RegisterPurchaseDetailRequest[];
}

export interface PurchaseDetailResponseDto {
  partPurchaseDetailId: number;
  partId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface RegisterPurchaseResponseDto {
  partPurchaseId: number;
  supplierId: number;
  purchaseDate: string;
  total: number;
  details: PurchaseDetailResponseDto[];
}
