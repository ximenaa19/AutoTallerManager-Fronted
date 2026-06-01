import { useEffect, useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { inventoryApi } from '@/features/admin/inventory/api/inventory.api';
import type { PartDto } from '@/features/admin/inventory/types/parts.types';
import type { LowStockPartDto } from '@/features/admin/inventory/types/inventory.types';
import { formatNumber } from '@/utils/format';

type AdjustablePart = PartDto | LowStockPartDto;

export interface AdjustStockModalProps {
  open: boolean;
  part: AdjustablePart | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function AdjustStockModal({
  open,
  part,
  onClose,
  onSuccess,
}: AdjustStockModalProps) {
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAdjustmentQuantity('');
      setReason('');
      setFieldError(null);
      setApiError(null);
    }
  }, [open, part?.partId]);

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!part) return;

    setFieldError(null);
    setApiError(null);

    const parsed = Number(adjustmentQuantity);
    if (!Number.isFinite(parsed) || parsed === 0) {
      setFieldError('Enter a non-zero adjustment (positive to add, negative to remove)');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await inventoryApi.adjustStock({
        partId: part.partId,
        adjustmentQuantity: parsed,
        reason: reason.trim() || undefined,
      });

      onSuccess(
        `Stock updated for ${part.code}: ${formatNumber(response.data.previousStock)} → ${formatNumber(response.data.newStock)}`,
      );
      onClose();
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Adjust stock"
      description={
        part
          ? `${part.code} — current stock: ${formatNumber(part.stock)}`
          : undefined
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Adjustment quantity"
          name="adjustmentQuantity"
          type="number"
          value={adjustmentQuantity}
          onChange={(event) => setAdjustmentQuantity(event.target.value)}
          hint="Use positive values to add stock, negative to remove."
          required
        />
        <Textarea
          label="Reason (optional)"
          name="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
        />

        {fieldError && (
          <p className="text-sm text-danger" role="alert">
            {fieldError}
          </p>
        )}
        {apiError && (
          <p className="text-sm text-danger" role="alert">
            {apiError}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Apply adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
