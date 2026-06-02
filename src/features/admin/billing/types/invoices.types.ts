/** Types aligned with api-contract.md §9–§10 Invoicing. */

export const INVOICE_STATUS_IDS = {
  draft: 1,
  issued: 2,
  paid: 3,
  cancelled: 4,
} as const;

export interface InvoiceDto {
  invoiceId: number;
  invoiceNumber: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  invoiceDate: string;
  subtotal: number;
  tax: number;
  total: number;
  observations?: string;
}

export interface CreateInvoiceRequest {
  invoiceNumber?: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  invoiceDate?: string;
  tax: number;
  observations?: string;
}

export interface UpdateInvoiceRequest {
  invoiceNumber?: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  invoiceDate: string;
  tax: number;
  observations?: string;
}

export interface GenerateInvoiceFromServiceOrderRequest {
  invoiceNumber?: string;
  invoiceStatusId?: number;
  tax: number;
  observations?: string;
}

export interface CancelInvoiceRequest {
  reason?: string;
}

export interface GeneratedInvoiceDetailDto {
  invoiceDetailId: number;
  sourcePartId?: number;
  concept: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  lineType: string;
}

export interface GeneratedInvoiceDto {
  invoiceId: number;
  invoiceNumber: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  invoiceDate: string;
  subtotal: number;
  tax: number;
  total: number;
  observations?: string;
  details?: GeneratedInvoiceDetailDto[];
}

export interface InvoiceBusinessResultDto {
  invoiceId: number;
  action: string;
  success: boolean;
  subtotal: number;
  tax: number;
  total: number;
}

export interface InvoiceSearchResultDto {
  invoiceId: number;
  invoiceNumber: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  total: number;
  invoiceDate: string;
}

export function formatInvoiceStatusLabel(
  invoiceStatusId: number,
  catalogNameById?: Map<number, string>,
): string {
  if (catalogNameById?.has(invoiceStatusId)) {
    return catalogNameById.get(invoiceStatusId)!;
  }

  switch (invoiceStatusId) {
    case INVOICE_STATUS_IDS.draft:
      return 'Draft';
    case INVOICE_STATUS_IDS.issued:
      return 'Issued';
    case INVOICE_STATUS_IDS.paid:
      return 'Paid';
    case INVOICE_STATUS_IDS.cancelled:
      return 'Cancelled';
    default:
      return `Status #${invoiceStatusId}`;
  }
}
