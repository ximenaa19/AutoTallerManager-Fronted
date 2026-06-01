export interface PartPurchaseDto {
  partPurchaseId: number;
  supplierId: number;
  purchaseDate: string;
  total: number;
}

export interface CreatePartPurchaseRequest {
  supplierId: number;
  purchaseDate?: string;
}

export interface CreatePartPurchaseDetailRequest {
  partPurchaseId: number;
  partId: number;
  quantity: number;
  unitPrice: number;
}

export interface UpdatePartPurchaseRequest {
  supplierId: number;
  purchaseDate: string;
}

export interface PartPurchaseDetailDto {
  partPurchaseDetailId: number;
  partPurchaseId: number;
  partId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
