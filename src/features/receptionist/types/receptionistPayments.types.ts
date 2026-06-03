import type { CatalogItemDto } from '@/types/catalogs.types';
import type { InvoiceSearchResultDto as BaseInvoiceSearchResultDto } from '@/features/receptionist/types/receptionistInvoices.types';

export type InvoiceSearchResultDto = BaseInvoiceSearchResultDto;

export type PaymentMethodDto = CatalogItemDto;

export type PaymentStatusDto = CatalogItemDto;

export type CardTypeDto = CatalogItemDto;

export interface InvoicePaymentSummaryPaymentDto {
  paymentId: number;
  paymentMethodId: number;
  paymentStatusId: number;
  paymentDate: string;
  amount: number;
  reference?: string;
}

export interface InvoicePaymentSummaryDto {
  invoiceId: number;
  invoiceNumber?: string;
  invoiceStatusId?: number;
  invoiceTotal: number;
  completedPaidAmount?: number;
  paidAmount?: number;
  refundedAmount?: number;
  pendingAmount?: number;
  payments: InvoicePaymentSummaryPaymentDto[];
}

export interface PaymentCardDetailsRequest {
  cardTypeId: number;
  lastFourDigits: string;
  cardHolder?: string;
  authorizationCode?: string;
}

export interface RecordPaymentRequest {
  paymentMethodId: number;
  paymentStatusId?: number;
  paymentDate?: string;
  amount: number;
  reference?: string;
  card?: PaymentCardDetailsRequest;
}

export interface RecordPaymentResponseDto {
  paymentId: number;
  invoiceId: number;
  paymentMethodId: number;
  paymentStatusId: number;
  paymentDate: string;
  amount: number;
  reference?: string;
  paymentCardId?: number;
}

export interface PaymentCatalogsDto {
  paymentMethods: PaymentMethodDto[];
  paymentStatuses: PaymentStatusDto[];
  cardTypes: CardTypeDto[];
}
