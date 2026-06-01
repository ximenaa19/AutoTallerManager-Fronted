import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import type { CancelServiceOrderRequest } from '@/features/admin/serviceOrders/types/serviceOrders.types';

export interface CancelOrderModalProps {
  open: boolean;
  serviceOrderId: number;
  onClose: () => void;
  onSubmit: (payload: CancelServiceOrderRequest) => Promise<void>;
}

export function CancelOrderModal({
  open,
  serviceOrderId,
  onClose,
  onSubmit,
}: CancelOrderModalProps) {
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
      setFieldError('Cancellation reason is required');
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
      title="Cancel service order"
      description={`Cancel order #${serviceOrderId}. This marks the order as cancelled in the workshop workflow.`}
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
          placeholder="Why is this order being cancelled?"
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
            Cancel order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
