import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import type { VoidServiceOrderRequest } from '@/features/admin/serviceOrders/types/serviceOrders.types';

export interface VoidOrderModalProps {
  open: boolean;
  serviceOrderId: number;
  onClose: () => void;
  onSubmit: (payload: VoidServiceOrderRequest) => Promise<void>;
}

export function VoidOrderModal({
  open,
  serviceOrderId,
  onClose,
  onSubmit,
}: VoidOrderModalProps) {
  const [reason, setReason] = useState('');
  const [observation, setObservation] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setReason('');
    setObservation('');
    setFieldError(null);
    setApiError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    if (!reason.trim()) {
      setFieldError('Void reason is required');
      return;
    }

    setFieldError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        reason: reason.trim(),
        observation: observation.trim() || undefined,
      });
      handleClose();
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
      title="Void service order"
      description={`Void order #${serviceOrderId}. Admin-only action — use when the order must be invalidated in the system.`}
      size="md"
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        {apiError && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
          >
            {apiError}
          </div>
        )}

        <Textarea
          name="reason"
          label="Reason"
          required
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          error={fieldError ?? undefined}
          placeholder="Why is this order being voided?"
          rows={3}
        />

        <Textarea
          name="observation"
          label="Observation (optional)"
          value={observation}
          onChange={(event) => setObservation(event.target.value)}
          rows={2}
        />

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Keep order
          </Button>
          <Button type="submit" variant="danger" isLoading={isSubmitting}>
            Void order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
