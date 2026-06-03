import { useCallback, useState } from 'react';
import type { RecordPaymentRequest } from '@/features/receptionist/types/receptionistPayments.types';

export interface UseReceptionistPaymentFormParams {
  defaultPaymentMethodId?: number;
  defaultPaymentStatusId?: number;
}

export interface UseReceptionistPaymentFormResult {
  paymentMethodId: string;
  setPaymentMethodId: (value: string) => void;
  paymentStatusId: string;
  setPaymentStatusId: (value: string) => void;
  paymentDate: string;
  setPaymentDate: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  reference: string;
  setReference: (value: string) => void;
  cardTypeId: string;
  setCardTypeId: (value: string) => void;
  lastFourDigits: string;
  setLastFourDigits: (value: string) => void;
  cardHolder: string;
  setCardHolder: (value: string) => void;
  authorizationCode: string;
  setAuthorizationCode: (value: string) => void;
  reset: (params?: UseReceptionistPaymentFormResetParams) => void;
  buildRequest: (params: BuildPaymentRequestParams) => BuildPaymentRequestResult;
  getPaymentMethodIdNumber: () => number;
  isAmountEmpty: boolean;
  isPendingAmountExceeding: (pendingAmount: number | null) => boolean;
}

export interface UseReceptionistPaymentFormResetParams {
  paymentMethodId?: number;
  paymentStatusId?: number;
}

export interface BuildPaymentRequestParams {
  invoiceId: number;
  isCardPayment: boolean;
  pendingAmount: number | null;
}

export interface BuildPaymentRequestResult {
  request?: RecordPaymentRequest;
  error?: string;
}

function toIso(value: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalizedDate = new Date(value);
  if (Number.isNaN(normalizedDate.getTime())) {
    return undefined;
  }

  return normalizedDate.toISOString();
}

function toLocalDateTimeInputValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function useReceptionistPaymentForm(
  params: UseReceptionistPaymentFormParams = {},
): UseReceptionistPaymentFormResult {
  const [paymentMethodId, setPaymentMethodId] = useState(
    params.defaultPaymentMethodId ? String(params.defaultPaymentMethodId) : '',
  );
  const [paymentStatusId, setPaymentStatusId] = useState(
    params.defaultPaymentStatusId ? String(params.defaultPaymentStatusId) : '',
  );
  const [paymentDate, setPaymentDate] = useState(toLocalDateTimeInputValue(new Date()));
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [cardTypeId, setCardTypeId] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState('');

  const reset = useCallback(
    (resetParams: UseReceptionistPaymentFormResetParams = {}) => {
      setPaymentMethodId(
        resetParams.paymentMethodId ? String(resetParams.paymentMethodId) : paymentMethodId,
      );
      setPaymentStatusId(
        resetParams.paymentStatusId ? String(resetParams.paymentStatusId) : paymentStatusId,
      );
      setPaymentDate(toLocalDateTimeInputValue(new Date()));
      setAmount('');
      setReference('');
      setCardTypeId('');
      setLastFourDigits('');
      setCardHolder('');
      setAuthorizationCode('');
    },
    [paymentMethodId, paymentStatusId],
  );

  const buildRequest = useCallback(
    ({
      invoiceId,
      isCardPayment,
      pendingAmount,
    }: BuildPaymentRequestParams): BuildPaymentRequestResult => {
      if (!invoiceId || invoiceId <= 0) {
        return { error: 'Select an invoice before recording a payment.' };
      }

      const paymentMethodIdValue = Number(paymentMethodId);
      if (!paymentMethodIdValue || Number.isNaN(paymentMethodIdValue)) {
        return { error: 'Payment method is required.' };
      }

      const amountValue = Number(amount);
      if (!amount.trim() || Number.isNaN(amountValue) || amountValue <= 0) {
        return { error: 'Amount must be greater than 0.' };
      }

      if (pendingAmount !== null && amountValue > pendingAmount) {
        return { error: 'Amount cannot exceed pending amount.' };
      }

      const request: RecordPaymentRequest = {
        paymentMethodId: paymentMethodIdValue,
        amount: amountValue,
      };

      if (paymentStatusId.trim()) {
        const parsedStatusId = Number(paymentStatusId);
        if (Number.isFinite(parsedStatusId) && parsedStatusId > 0) {
          request.paymentStatusId = parsedStatusId;
        }
      }

      const paymentDateValue = toIso(paymentDate);
      if (paymentDateValue) {
        request.paymentDate = paymentDateValue;
      }

      if (reference.trim()) {
        request.reference = reference.trim();
      }

      if (isCardPayment) {
        const cardTypeIdValue = Number(cardTypeId);
        const digits = lastFourDigits.trim().replace(/\D/g, '');

        if (!cardTypeIdValue || Number.isNaN(cardTypeIdValue)) {
          return { error: 'Card type is required for card payments.' };
        }

        if (digits.length !== 4) {
          return { error: 'Last four digits must contain exactly 4 numbers.' };
        }

        request.card = {
          cardTypeId: cardTypeIdValue,
          lastFourDigits: digits,
          ...(cardHolder.trim() ? { cardHolder: cardHolder.trim() } : {}),
          ...(authorizationCode.trim()
            ? { authorizationCode: authorizationCode.trim() }
            : {}),
        };
      }

      return { request };
    },
    [
      paymentMethodId,
      paymentStatusId,
      paymentDate,
      amount,
      reference,
      cardTypeId,
      lastFourDigits,
      cardHolder,
      authorizationCode,
    ],
  );

  const getPaymentMethodIdNumber = useCallback(() => Number(paymentMethodId), [paymentMethodId]);

  const isAmountEmpty = amount.trim().length === 0;

  const isPendingAmountExceeding = useCallback(
    (pendingAmountValue: number | null) => {
      if (pendingAmountValue === null) {
        return false;
      }

      const amountValue = Number(amount);
      if (Number.isNaN(amountValue) || amountValue <= 0) {
        return false;
      }

      return amountValue > pendingAmountValue;
    },
    [amount],
  );

  return {
    paymentMethodId,
    setPaymentMethodId,
    paymentStatusId,
    setPaymentStatusId,
    paymentDate,
    setPaymentDate,
    amount,
    setAmount,
    reference,
    setReference,
    cardTypeId,
    setCardTypeId,
    lastFourDigits,
    setLastFourDigits,
    cardHolder,
    setCardHolder,
    authorizationCode,
    setAuthorizationCode,
    reset,
    buildRequest,
    getPaymentMethodIdNumber,
    isAmountEmpty,
    isPendingAmountExceeding,
  };
}

