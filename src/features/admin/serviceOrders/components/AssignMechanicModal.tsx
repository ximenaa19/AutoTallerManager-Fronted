import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MechanicSearchSelector } from '@/features/admin/serviceOrders/components/MechanicSearchSelector';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import type { AssignMechanicRequest } from '@/features/admin/serviceOrders/types/orderServices.types';

export interface AssignMechanicModalProps {
  open: boolean;
  orderServiceId: number;
  lookups: WorkshopCatalogLookups;
  onClose: () => void;
  onSubmit: (payload: AssignMechanicRequest) => Promise<void>;
}

export function AssignMechanicModal({
  open,
  orderServiceId,
  lookups,
  onClose,
  onSubmit,
}: AssignMechanicModalProps) {
  const [assignment, setAssignment] = useState<{
    mechanicPersonId: number;
    specialtyId: number;
  } | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setAssignment(null);
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

    if (!assignment) {
      setFieldError('Select a mechanic and specialty');
      return;
    }

    setFieldError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(assignment);
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
      title="Assign mechanic"
      description={`Assign a mechanic to service line #${orderServiceId}.`}
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

        <MechanicSearchSelector
          value={assignment}
          onChange={setAssignment}
          lookups={lookups}
          error={fieldError ?? undefined}
        />

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Assign mechanic
          </Button>
        </div>
      </form>
    </Modal>
  );
}
