import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';
import { formatCurrency } from '@/utils/format';

export interface RefundPaymentModalProps {
  open: boolean;
  paymentId: number;
  amount: number;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RefundPaymentModal({
  open,
  paymentId,
  amount,
  isLoading = false,
  onClose,
  onConfirm,
}: RefundPaymentModalProps) {
  return (
    <ConfirmActionModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Refund payment"
      description={`Refund payment #${paymentId} for ${formatCurrency(amount)}? The payment status will be updated to Refunded.`}
      confirmLabel="Refund payment"
      variant="danger"
      isLoading={isLoading}
    />
  );
}
