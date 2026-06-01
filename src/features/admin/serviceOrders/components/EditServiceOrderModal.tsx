import { useEffect, useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { ServiceOrderStatusBadge } from '@/features/admin/serviceOrders/components/ServiceOrderStatusBadge';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import {
  ORDER_STATUS_IDS,
  type ServiceOrderFullDetailDto,
  type UpdateServiceOrderRequest,
} from '@/features/admin/serviceOrders/types/serviceOrders.types';

function toDateInputValue(iso: string | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function toIsoDate(dateValue: string): string {
  return `${dateValue}T00:00:00Z`;
}

function isCancelledOrVoided(orderStatusId: number): boolean {
  return (
    orderStatusId === ORDER_STATUS_IDS.cancelled ||
    orderStatusId === ORDER_STATUS_IDS.voided
  );
}

export interface EditServiceOrderModalProps {
  open: boolean;
  order: ServiceOrderFullDetailDto;
  lookups: WorkshopCatalogLookups;
  onClose: () => void;
  onSubmit: (payload: UpdateServiceOrderRequest) => Promise<void>;
}

export function EditServiceOrderModal({
  open,
  order,
  lookups,
  onClose,
  onSubmit,
}: EditServiceOrderModalProps) {
  const [vehicleId, setVehicleId] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [generalDescription, setGeneralDescription] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setVehicleId(String(order.vehicleId));
    setEntryDate(toDateInputValue(order.entryDate));
    setEstimatedDeliveryDate(toDateInputValue(order.estimatedDeliveryDate));
    setGeneralDescription(order.generalDescription ?? '');
    setFieldError(null);
    setApiError(null);
  }, [open, order]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    const parsedVehicleId = Number(vehicleId);
    if (!Number.isFinite(parsedVehicleId) || parsedVehicleId <= 0) {
      setFieldError('Enter a valid vehicle ID');
      return;
    }

    if (!entryDate.trim()) {
      setFieldError('Entry date is required');
      return;
    }

    setFieldError(null);
    setIsSubmitting(true);

    const payload: UpdateServiceOrderRequest = {
      vehicleId: parsedVehicleId,
      orderStatusId: order.orderStatusId,
      entryDate: toIsoDate(entryDate),
      estimatedDeliveryDate: estimatedDeliveryDate.trim()
        ? toIsoDate(estimatedDeliveryDate)
        : undefined,
      generalDescription: generalDescription.trim() || undefined,
    };

    if (isCancelledOrVoided(order.orderStatusId)) {
      payload.cancellationReason = order.cancellationReason;
      payload.cancellationDate = order.cancellationDate;
    }

    try {
      await onSubmit(payload);
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
      onClose={onClose}
      title={`Edit order #${order.serviceOrderId}`}
      description="Update header fields. Use workflow actions on the right to change status."
      size="lg"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="edit-service-order-form" isLoading={isSubmitting}>
            Save changes
          </Button>
        </div>
      }
    >
      <form
        id="edit-service-order-form"
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-4"
      >
        {apiError && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
          >
            {apiError}
          </div>
        )}

        {fieldError && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
          >
            {fieldError}
          </div>
        )}

        <div className="rounded-lg border border-border bg-bg-muted/30 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Status</p>
          <div className="mt-2">
            <ServiceOrderStatusBadge
              orderStatusId={order.orderStatusId}
              catalogNameById={lookups.orderStatusNameById}
            />
          </div>
          <p className="mt-2 text-xs text-text-secondary">
            Status is not editable here. Use Change status, Cancel, Void, or Complete in the
            actions panel.
          </p>
        </div>

        <Input
          name="vehicleId"
          label="Vehicle ID"
          type="number"
          required
          min={1}
          value={vehicleId}
          onChange={(event) => setVehicleId(event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="entryDate"
            label="Entry date"
            type="date"
            required
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
          />
          <Input
            name="estimatedDeliveryDate"
            label="Estimated delivery"
            type="date"
            value={estimatedDeliveryDate}
            onChange={(event) => setEstimatedDeliveryDate(event.target.value)}
          />
        </div>

        <Textarea
          name="generalDescription"
          label="General description"
          value={generalDescription}
          onChange={(event) => setGeneralDescription(event.target.value)}
          rows={4}
        />
      </form>
    </Modal>
  );
}
