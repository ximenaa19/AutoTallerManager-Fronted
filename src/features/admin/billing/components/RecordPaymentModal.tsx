import { useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { paymentsApi } from '@/features/admin/billing/api/payments.api';
import type { BillingLookups } from '@/features/admin/billing/hooks/useBillingLookups';
import {
  PAYMENT_METHOD_IDS,
  type PaymentSummaryDto,
  type RecordPaymentRequest,
} from '@/features/admin/billing/types/payments.types';
import { formatCurrency } from '@/utils/format';

export interface RecordPaymentModalProps {
  open: boolean;
  invoiceId: number;
  invoiceNumber: string;
  summary?: PaymentSummaryDto | null;
  lookups: BillingLookups;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function toLocalDateTimeInputValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function RecordPaymentModal({
  open,
  invoiceId,
  invoiceNumber,
  summary,
  lookups,
  onClose,
  onSuccess,
}: RecordPaymentModalProps) {
  const pendingAmount = summary?.pendingAmount ?? 0;

  const [paymentMethodId, setPaymentMethodId] = useState(
    String(PAYMENT_METHOD_IDS.cash),
  );
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(toLocalDateTimeInputValue(new Date()));
  const [reference, setReference] = useState('');
  const [cardTypeId, setCardTypeId] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isCardMethod = Number(paymentMethodId) === PAYMENT_METHOD_IDS.card;

  const paymentMethodOptions = useMemo(
    () =>
      lookups.paymentMethods.map((method) => ({
        value: String(method.paymentMethodId),
        label: method.name,
      })),
    [lookups.paymentMethods],
  );

  const cardTypeOptions = useMemo(
    () =>
      lookups.cardTypes.map((cardType) => ({
        value: String(cardType.cardTypeId),
        label: cardType.name,
      })),
    [lookups.cardTypes],
  );

  useEffect(() => {
    if (!open) return;

    setPaymentMethodId(String(PAYMENT_METHOD_IDS.cash));
    setAmount(pendingAmount > 0 ? String(pendingAmount) : '');
    setPaymentDate(toLocalDateTimeInputValue(new Date()));
    setReference('');
    setCardTypeId(cardTypeOptions[0]?.value ?? '');
    setLastFourDigits('');
    setCardHolder('');
    setAuthorizationCode('');
    setSubmitError(null);
  }, [open, pendingAmount, cardTypeOptions]);

  const handleSubmit = async () => {
    const methodId = Number(paymentMethodId);
    const amountValue = Number(amount);

    if (!methodId || Number.isNaN(amountValue) || amountValue <= 0) {
      setSubmitError('Enter a valid payment amount.');
      return;
    }

    if (isCardMethod) {
      if (!cardTypeId || !lastFourDigits.trim() || !cardHolder.trim()) {
        setSubmitError('Card payments require card type, last four digits, and cardholder.');
        return;
      }
      if (lastFourDigits.trim().length !== 4) {
        setSubmitError('Last four digits must be exactly 4 characters.');
        return;
      }
    }

    setSubmitting(true);
    setSubmitError(null);

    const body: RecordPaymentRequest = {
      paymentMethodId: methodId,
      amount: amountValue,
      paymentDate: paymentDate ? new Date(paymentDate).toISOString() : undefined,
      reference: reference.trim() || undefined,
    };

    if (isCardMethod) {
      body.card = {
        cardTypeId: Number(cardTypeId),
        lastFourDigits: lastFourDigits.trim(),
        cardHolder: cardHolder.trim(),
        authorizationCode: authorizationCode.trim() || undefined,
      };
    }

    try {
      const response = await paymentsApi.recordPayment(invoiceId, body);
      onSuccess(
        `Payment #${response.data.paymentId} recorded for invoice ${invoiceNumber}.`,
      );
      onClose();
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record payment"
      description={`Register a payment against invoice ${invoiceNumber}. Pending balance: ${formatCurrency(pendingAmount)}.`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={submitting}>
            Record payment
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Select
          name="payment-method"
          label="Payment method"
          required
          value={paymentMethodId}
          onChange={(event) => setPaymentMethodId(event.target.value)}
          options={paymentMethodOptions}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="amount"
            label="Amount"
            type="number"
            min={0.01}
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <Input
            name="payment-date"
            label="Payment date"
            type="datetime-local"
            required
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
          />
        </div>

        <Input
          name="reference"
          label="Reference (optional)"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="Receipt or transfer reference"
        />

        {isCardMethod && (
          <div className="rounded-lg border border-border bg-bg-elevated p-4">
            <p className="mb-3 text-sm font-medium text-text-primary">Card details</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                name="card-type"
                label="Card type"
                required
                value={cardTypeId}
                onChange={(event) => setCardTypeId(event.target.value)}
                options={cardTypeOptions}
              />
              <Input
                name="last-four"
                label="Last four digits"
                required
                maxLength={4}
                value={lastFourDigits}
                onChange={(event) =>
                  setLastFourDigits(event.target.value.replace(/\D/g, '').slice(0, 4))
                }
              />
              <Input
                name="card-holder"
                label="Cardholder"
                required
                value={cardHolder}
                onChange={(event) => setCardHolder(event.target.value)}
              />
              <Input
                name="auth-code"
                label="Authorization code (optional)"
                value={authorizationCode}
                onChange={(event) => setAuthorizationCode(event.target.value)}
              />
            </div>
          </div>
        )}

        {submitError && (
          <p className="text-sm text-danger" role="alert">
            {submitError}
          </p>
        )}
      </div>
    </Modal>
  );
}
