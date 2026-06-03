import { Modal } from '@/components/ui/Modal';
import { MechanicPartRequestForm } from '@/features/mechanic/components/MechanicPartRequestForm';
import type { RequestPartRequest } from '@/features/mechanic/types/mechanicPartRequests.types';

export interface MechanicPartRequestModalProps {
  open: boolean;
  orderServiceId: number;
  serviceTypeLabel?: string;
  onClose: () => void;
  onSubmit: (payload: RequestPartRequest) => Promise<void>;
}

export function MechanicPartRequestModal({
  open,
  orderServiceId,
  serviceTypeLabel,
  onClose,
  onSubmit,
}: MechanicPartRequestModalProps) {
  const description = serviceTypeLabel
    ? `Add a part request to ${serviceTypeLabel} (order service #${orderServiceId}).`
    : `Add a part request to order service #${orderServiceId}.`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request part"
      description={description}
      size="md"
    >
      <MechanicPartRequestForm
        orderServiceId={orderServiceId}
        onSubmit={async (payload) => {
          await onSubmit(payload);
          onClose();
        }}
        onCancel={onClose}
        submitLabel="Request part"
      />
    </Modal>
  );
}
