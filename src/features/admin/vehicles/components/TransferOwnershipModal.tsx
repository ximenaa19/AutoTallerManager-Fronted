import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PersonSelector } from '@/features/admin/components/PersonSelector';
import type { TransferVehicleOwnershipRequest } from '@/features/admin/vehicles/types/vehicles.types';

export interface TransferOwnershipModalProps {
  open: boolean;
  vehicleId: number;
  onClose: () => void;
  onSubmit: (payload: TransferVehicleOwnershipRequest) => Promise<void>;
}

export function TransferOwnershipModal({
  open,
  vehicleId,
  onClose,
  onSubmit,
}: TransferOwnershipModalProps) {
  const [newOwnerPersonId, setNewOwnerPersonId] = useState<number | null>(null);
  const [transferDate, setTransferDate] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setNewOwnerPersonId(null);
    setTransferDate('');
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

    if (!newOwnerPersonId) {
      setFieldError('Select the new owner');
      return;
    }

    setFieldError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        newOwnerPersonId,
        transferDate: transferDate ? `${transferDate}T00:00:00Z` : undefined,
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
      title="Transfer vehicle ownership"
      description={`Assign vehicle #${vehicleId} to a different customer.`}
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

        <PersonSelector
          value={newOwnerPersonId}
          onChange={setNewOwnerPersonId}
          error={fieldError ?? undefined}
        />

        <Input
          name="transferDate"
          label="Transfer date (optional)"
          type="date"
          value={transferDate}
          onChange={(event) => setTransferDate(event.target.value)}
          hint="Defaults on the server when omitted."
        />

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Transfer ownership
          </Button>
        </div>
      </form>
    </Modal>
  );
}
