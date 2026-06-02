import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';

export interface RecalculateInvoiceModalProps {
  open: boolean;
  invoiceNumber: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RecalculateInvoiceModal({
  open,
  invoiceNumber,
  isLoading = false,
  onClose,
  onConfirm,
}: RecalculateInvoiceModalProps) {
  return (
    <ConfirmActionModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Recalculate invoice"
      description={`Recalculate line subtotals and totals for invoice ${invoiceNumber}? Existing line quantities and unit prices will be used.`}
      confirmLabel="Recalculate"
      variant="primary"
      isLoading={isLoading}
    />
  );
}
