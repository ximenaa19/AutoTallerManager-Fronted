export interface ClientInvoiceDto {
  invoiceId: number;
  invoiceNumber: string;
  serviceOrderId: number;
  invoiceStatusId: number;
  invoiceDate: string;
  subtotal: number;
  tax: number;
  total: number;
  observations?: string | null;
}

export interface ClientInvoicePaymentSummaryDto {
  invoiceId: number;
  invoiceNumber: string;
  invoiceTotal: number;
  completedPaidAmount: number;
  refundedAmount: number;
  pendingAmount: number;
  payments: ClientInvoicePaymentSummaryItemDto[];
}

export interface ClientInvoicePaymentSummaryItemDto {
  paymentId: number;
  paymentMethodId: number;
  paymentStatusId: number;
  paymentDate: string;
  amount: number;
  reference?: string | null;
}

export interface ClientInvoiceDetailDto {
  invoiceDetailId: number;
  invoiceId: number;
  sourcePartId?: number | null;
  concept: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  lineType: string;
}

export interface ClientInvoiceDetailsByInvoiceDto {
  invoiceId: number;
  invoiceNumber: string;
  invoiceStatusId: number;
  subtotal: number;
  tax: number;
  total: number;
  details: Array<Omit<ClientInvoiceDetailDto, 'invoiceId'>>;
}
