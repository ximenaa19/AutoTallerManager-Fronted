export interface PartDto {
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

export interface CreatePartRequest {
  partCategoryId: number;
  partBrandId?: number | null;
  code?: string;
  description?: string;
  stock: number;
  minimumStock: number;
  unitPrice: number;
  isActive?: boolean;
}

export interface UpdatePartRequest {
  partCategoryId: number;
  partBrandId?: number | null;
  code?: string;
  description?: string;
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

export interface PartCategoryRecord {
  partCategoryId: number;
  name: string;
}

export interface PartBrandRecord {
  partBrandId: number;
  name: string;
}
