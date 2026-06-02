/** Types aligned with api-contract.md §9–§10 Payments. */

export const PAYMENT_STATUS_IDS = {
  pending: 1,
  completed: 2,
  refunded: 3,
  failed: 4,
} as const;

export const PAYMENT_METHOD_IDS = {
  cash: 1,
  card: 2,
  bankTransfer: 3,
} as const;

export interface PaymentDto {
  paymentId: number;
  invoiceId: number;
  paymentMethodId: number;
  paymentStatusId: number;
  paymentDate: string;
  amount: number;
  reference?: string;
}

export interface PaymentCardDto {
  paymentCardId: number;
  paymentId: number;
  cardTypeId: number;
  lastFourDigits: string;
  cardHolder: string;
  authorizationCode?: string;
}

export interface PaymentCardDetailsRequest {
  cardTypeId: number;
  lastFourDigits?: string;
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

export interface RecordedPaymentDto {
  paymentId: number;
  invoiceId: number;
  paymentMethodId: number;
  paymentStatusId: number;
  paymentDate: string;
  amount: number;
  reference?: string;
  paymentCardId?: number;
}

export interface PaymentSummaryItemDto {
  paymentId: number;
  paymentMethodId: number;
  paymentStatusId: number;
  paymentDate: string;
  amount: number;
  reference?: string;
}

export interface PaymentSummaryDto {
  invoiceId: number;
  invoiceNumber: string;
  invoiceTotal: number;
  completedPaidAmount: number;
  refundedAmount: number;
  pendingAmount: number;
  payments: PaymentSummaryItemDto[];
}

export function formatPaymentStatusLabel(
  paymentStatusId: number,
  catalogNameById?: Map<number, string>,
): string {
  if (catalogNameById?.has(paymentStatusId)) {
    return catalogNameById.get(paymentStatusId)!;
  }

  switch (paymentStatusId) {
    case PAYMENT_STATUS_IDS.pending:
      return 'Pending';
    case PAYMENT_STATUS_IDS.completed:
      return 'Completed';
    case PAYMENT_STATUS_IDS.refunded:
      return 'Refunded';
    case PAYMENT_STATUS_IDS.failed:
      return 'Failed';
    default:
      return `Status #${paymentStatusId}`;
  }
}

export function formatPaymentMethodLabel(
  paymentMethodId: number,
  catalogNameById?: Map<number, string>,
): string {
  if (catalogNameById?.has(paymentMethodId)) {
    return catalogNameById.get(paymentMethodId)!;
  }

  switch (paymentMethodId) {
    case PAYMENT_METHOD_IDS.cash:
      return 'Cash';
    case PAYMENT_METHOD_IDS.card:
      return 'Card';
    case PAYMENT_METHOD_IDS.bankTransfer:
      return 'Bank Transfer';
    default:
      return `Method #${paymentMethodId}`;
  }
}
