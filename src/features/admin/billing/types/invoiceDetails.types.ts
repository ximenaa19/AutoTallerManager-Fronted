/** Types aligned with api-contract.md §10 Invoice details. */

export interface InvoiceDetailDto {
  invoiceDetailId: number;
  invoiceId: number;
  sourcePartId?: number;
  concept: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  lineType: string;
}

export interface InvoiceDetailLineDto {
  invoiceDetailId: number;
  sourcePartId?: number | null;
  concept: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  lineType: string;
}

export interface InvoiceDetailsByInvoiceDto {
  invoiceId: number;
  invoiceNumber: string;
  invoiceStatusId: number;
  subtotal: number;
  tax: number;
  total: number;
  details: InvoiceDetailLineDto[];
}
