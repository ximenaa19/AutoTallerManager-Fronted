import { httpClient } from '@/api/httpClient';
import type {
  PaymentCardDto,
  PaymentSummaryDto,
  RecordedPaymentDto,
  RecordPaymentRequest,
  PaymentDto,
} from '@/features/admin/billing/types/payments.types';

export const paymentsApi = {
  getAll() {
    return httpClient.get<PaymentDto[]>('/api/payments');
  },

  getById(id: number) {
    return httpClient.get<PaymentDto>(`/api/payments/${id}`);
  },

  getPaymentCards() {
    return httpClient.get<PaymentCardDto[]>('/api/payment-cards');
  },

  getPaymentSummary(invoiceId: number) {
    return httpClient.get<PaymentSummaryDto>(
      `/api/invoices/${invoiceId}/payment-summary`,
    );
  },

  recordPayment(invoiceId: number, body: RecordPaymentRequest) {
    return httpClient.post<RecordedPaymentDto>(
      `/api/invoices/${invoiceId}/record-payment`,
      body,
    );
  },

  refund(paymentId: number) {
    return httpClient.post<RecordedPaymentDto>(
      `/api/payments/${paymentId}/refund`,
    );
  },
};
