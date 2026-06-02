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
