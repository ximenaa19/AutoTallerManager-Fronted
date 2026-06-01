export interface SupplierDto {
  supplierId: number;
  name: string;
  taxId?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
}

export interface CreateSupplierRequest {
  name?: string;
  taxId?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateSupplierRequest {
  name?: string;
  taxId?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface SupplierSearchResultDto {
  supplierId: number;
  name: string;
  taxId?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}
