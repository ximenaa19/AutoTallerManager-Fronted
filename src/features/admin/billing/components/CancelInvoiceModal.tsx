import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export interface CancelInvoiceModalProps {
  open: boolean;
  invoiceNumber: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelInvoiceModal({
  open,
  invoiceNumber,
  isLoading = false,
  onClose,
  onConfirm,
}: CancelInvoiceModalProps) {
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
      title="Cancel invoice"
      description={`Cancel invoice ${invoiceNumber}? Completed payments must not exist on this invoice.`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Keep invoice
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={!reason.trim()}
          >
            Cancel invoice
          </Button>
        </>
      }
    >
      <Input
        name="cancel-reason"
        label="Cancellation reason"
        required
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Explain why this invoice is being cancelled"
      />
    </Modal>
  );
}
