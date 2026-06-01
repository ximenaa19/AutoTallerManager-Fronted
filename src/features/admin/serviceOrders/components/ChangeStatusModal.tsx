import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import type { ChangeServiceOrderStatusRequest } from '@/features/admin/serviceOrders/types/serviceOrders.types';

export interface ChangeStatusModalProps {
  open: boolean;
  currentStatusId: number;
  lookups: WorkshopCatalogLookups;
  onClose: () => void;
  onSubmit: (payload: ChangeServiceOrderStatusRequest) => Promise<void>;
}

export function ChangeStatusModal({
  open,
  currentStatusId,
  lookups,
  onClose,
  onSubmit,
}: ChangeStatusModalProps) {
  const [newOrderStatusId, setNewOrderStatusId] = useState('');
  const [observation, setObservation] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setNewOrderStatusId('');
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

    const statusId = Number(newOrderStatusId);
    if (!Number.isFinite(statusId) || statusId <= 0) {
      setFieldError('Select a new status');
      return;
    }

    if (statusId === currentStatusId) {
      setFieldError('Choose a different status than the current one');
      return;
    }

    setFieldError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        newOrderStatusId: statusId,
        observation: observation.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = lookups.orderStatuses
    .filter((status) => status.id !== currentStatusId)
    .map((status) => ({
      value: String(status.id),
      label: status.name,
    }));

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Change order status"
      description="Update the workflow status for this service order."
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

        <Select
          name="newOrderStatusId"
          label="New status"
          required
          value={newOrderStatusId}
          onChange={(event) => setNewOrderStatusId(event.target.value)}
          options={statusOptions}
          placeholder="Select status…"
          error={fieldError ?? undefined}
        />

        <Textarea
          name="observation"
          label="Observation (optional)"
          value={observation}
          onChange={(event) => setObservation(event.target.value)}
          placeholder="Optional note for the audit trail…"
          rows={3}
        />

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Update status
          </Button>
        </div>
      </form>
    </Modal>
  );
}
