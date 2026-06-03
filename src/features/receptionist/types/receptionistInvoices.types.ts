/** Types aligned with invoice-related endpoints for Receptionist. */

export const RECEPTIONIST_INVOICE_STATUS_IDS = {
  draft: 1,
  issued: 2,
  paid: 3,
  cancelled: 4,
} as const;

export interface InvoiceSearchResultDto {
  invoiceId: number;
  invoiceNumber: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  total: number;
  invoiceDate: string;
}

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

export interface GenerateInvoiceFromServiceOrderRequest {
  tax: number;
  observations?: string;
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
}

export interface InvoiceBusinessResultDto {
  invoiceId: number;
  action: string;
  success: boolean;
  subtotal: number;
  tax: number;
  total: number;
}

export interface InvoicePaymentSummaryItemDto {
  paymentId: number;
  paymentMethodId: number;
  paymentStatusId: number;
  paymentDate: string;
  amount: number;
  reference?: string;
}

export interface InvoicePaymentSummaryDto {
  invoiceId: number;
  invoiceNumber: string;
  invoiceTotal: number;
  completedPaidAmount: number;
  refundedAmount: number;
  pendingAmount: number;
  payments: InvoicePaymentSummaryItemDto[];
}
