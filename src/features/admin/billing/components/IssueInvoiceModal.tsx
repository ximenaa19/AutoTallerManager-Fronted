import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';

export interface IssueInvoiceModalProps {
  open: boolean;
  invoiceNumber: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function IssueInvoiceModal({
  open,
  invoiceNumber,
  isLoading = false,
  onClose,
  onConfirm,
}: IssueInvoiceModalProps) {
  return (
    <ConfirmActionModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Issue invoice"
      description={`Issue invoice ${invoiceNumber}? The invoice will move to Issued status and become ready for payment collection.`}
      confirmLabel="Issue invoice"
      variant="primary"
      isLoading={isLoading}
    />
  );
}
