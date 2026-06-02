import { useEffect, useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import type {
  CreateOrderServiceRequest,
  UpdateOrderServiceRequest,
} from '@/features/admin/serviceOrders/types/orderServices.types';
import type { ServiceOrderServiceSummaryDto } from '@/features/admin/serviceOrders/types/serviceOrders.types';
import { buildEditUpdateOrderServiceRequest } from '@/features/admin/serviceOrders/utils/orderServiceBilling';

export interface OrderServiceFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  serviceOrderId: number;
  initialService?: ServiceOrderServiceSummaryDto | null;
  lookups: WorkshopCatalogLookups;
  onClose: () => void;
  onSubmit: (
    payload: CreateOrderServiceRequest | UpdateOrderServiceRequest,
  ) => Promise<void>;
}

export function OrderServiceFormModal({
  open,
  mode,
  serviceOrderId,
  initialService,
  lookups,
  onClose,
  onSubmit,
}: OrderServiceFormModalProps) {
  const [serviceTypeId, setServiceTypeId] = useState('');
  const [description, setDescription] = useState('');
  const [laborCost, setLaborCost] = useState('0');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialService) {
      setServiceTypeId(String(initialService.serviceTypeId));
      setDescription(initialService.description ?? '');
      setLaborCost(String(initialService.laborCost));
    } else {
      setServiceTypeId('');
      setDescription('');
      setLaborCost('0');
    }
    setFieldError(null);
    setApiError(null);
  }, [open, mode, initialService]);

  const serviceTypeOptions = lookups.serviceTypes.map((type) => ({
    value: String(type.id),
    label: type.name,
  }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    const parsedTypeId = Number(serviceTypeId);
    const parsedLabor = Number(laborCost);

    if (!Number.isFinite(parsedTypeId) || parsedTypeId <= 0) {
      setFieldError('Select a service type');
      return;
    }

    if (!Number.isFinite(parsedLabor) || parsedLabor < 0) {
      setFieldError('Labor cost must be zero or greater');
      return;
    }

    setFieldError(null);
    setIsSubmitting(true);

    const formFields = {
      serviceTypeId: parsedTypeId,
      description: description.trim() || undefined,
      laborCost: parsedLabor,
    };

    const payload: CreateOrderServiceRequest | UpdateOrderServiceRequest =
      mode === 'edit' && initialService
        ? buildEditUpdateOrderServiceRequest(initialService, serviceOrderId, formFields)
        : {
            serviceOrderId,
            ...formFields,
          };

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
      title={mode === 'create' ? 'Add service' : `Edit service #${initialService?.orderServiceId ?? ''}`}
      description={
        mode === 'create'
          ? 'Add a line item to this service order.'
          : 'Update service type, description, and labor cost. Use Work report for work performed.'
      }
      size="md"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="order-service-form" isLoading={isSubmitting}>
            {mode === 'create' ? 'Add service' : 'Save changes'}
          </Button>
        </div>
      }
    >
      <form
        id="order-service-form"
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

        <Select
          name="serviceTypeId"
          label="Service type"
          required
          value={serviceTypeId}
          onChange={(event) => setServiceTypeId(event.target.value)}
          options={serviceTypeOptions}
          placeholder="Select service type"
        />

        <Textarea
          name="description"
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />

        <Input
          name="laborCost"
          label="Labor cost"
          type="number"
          required
          min={0}
          step="0.01"
          value={laborCost}
          onChange={(event) => setLaborCost(event.target.value)}
        />
      </form>
    </Modal>
  );
}
