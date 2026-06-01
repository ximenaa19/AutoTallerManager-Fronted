import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';

export interface CompleteOrderModalProps {
  open: boolean;
  serviceOrderId: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function CompleteOrderModal({
  open,
  serviceOrderId,
  onClose,
  onConfirm,
  isLoading = false,
}: CompleteOrderModalProps) {
  return (
    <ConfirmActionModal
      open={open}
      onClose={onClose}
      onConfirm={() => void onConfirm()}
      title="Complete service order"
      description={`Mark order #${serviceOrderId} as completed? All services should be finished before completing the order.`}
      confirmLabel="Complete order"
      variant="primary"
      isLoading={isLoading}
    />
  );
}
