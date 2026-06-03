import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export interface CancelPurchaseModalProps {
  open: boolean;
  purchaseId: number;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelPurchaseModal({
  open,
  purchaseId,
  isLoading = false,
  onClose,
  onConfirm,
}: CancelPurchaseModalProps) {
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(reason.trim());
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Cancel purchase"
      description={`Cancel purchase #${purchaseId}? Stock from all lines will be reverted. This action cannot be undone.`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Keep purchase
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={!reason.trim()}
          >
            Cancel purchase
          </Button>
        </>
      }
    >
      <Input
        name="cancel-purchase-reason"
        label="Cancellation reason"
        required
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Explain why this purchase is being cancelled"
      />
    </Modal>
  );
}
