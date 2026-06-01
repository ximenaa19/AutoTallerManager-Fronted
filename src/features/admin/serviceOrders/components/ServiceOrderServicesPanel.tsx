import { useState } from 'react';
import { Pencil, Plus, Trash2, UserMinus, UserPlus, Wrench } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';
import { AssignMechanicModal } from '@/features/admin/serviceOrders/components/AssignMechanicModal';
import { RequestPartModal } from '@/features/admin/serviceOrders/components/RequestPartModal';
import { OrderServiceFormModal } from '@/features/admin/serviceOrders/components/OrderServiceFormModal';
import { orderServicesApi } from '@/features/admin/serviceOrders/api/orderServices.api';
import {
  formatServiceTypeLabel,
  formatSpecialtyLabel,
  type WorkshopCatalogLookups,
} from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import {
  ORDER_STATUS_IDS,
  type ServiceOrderServiceSummaryDto,
} from '@/features/admin/serviceOrders/types/serviceOrders.types';
import { formatCurrency, formatDateTime } from '@/utils/format';

export interface ServiceOrderServicesPanelProps {
  serviceOrderId: number;
  orderStatusId: number;
  services: ServiceOrderServiceSummaryDto[];
  lookups: WorkshopCatalogLookups;
  onRefresh: () => void;
}

type ActiveModal =
  | { type: 'assign'; service: ServiceOrderServiceSummaryDto }
  | { type: 'unassign'; service: ServiceOrderServiceSummaryDto; assignmentId: number }
  | { type: 'requestPart'; service: ServiceOrderServiceSummaryDto }
  | { type: 'delete'; service: ServiceOrderServiceSummaryDto }
  | null;

type ServiceFormModal =
  | { mode: 'create' }
  | { mode: 'edit'; service: ServiceOrderServiceSummaryDto }
  | null;

export function ServiceOrderServicesPanel({
  serviceOrderId,
  orderStatusId,
  services,
  lookups,
  onRefresh,
}: ServiceOrderServicesPanelProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [serviceFormModal, setServiceFormModal] = useState<ServiceFormModal>(null);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [workPerformed, setWorkPerformed] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const startEditWorkReport = (service: ServiceOrderServiceSummaryDto) => {
    setEditingServiceId(service.orderServiceId);
    setWorkPerformed(service.workPerformed ?? '');
    setLaborCost(String(service.laborCost));
    setActionError(null);
  };

  const cancelEditWorkReport = () => {
    setEditingServiceId(null);
    setWorkPerformed('');
    setLaborCost('');
  };

  const handleSaveWorkReport = async (orderServiceId: number) => {
    setActionLoading(true);
    setActionError(null);

    try {
      const parsedLabor = laborCost.trim() ? Number(laborCost) : undefined;
      if (laborCost.trim() && (!Number.isFinite(parsedLabor) || parsedLabor! < 0)) {
        setActionError('Labor cost must be zero or greater');
        return;
      }

      await orderServicesApi.updateWorkReport(orderServiceId, {
        workPerformed: workPerformed.trim() || undefined,
        laborCost: parsedLabor,
      });
      setSuccessMessage('Work report updated.');
      cancelEditWorkReport();
      onRefresh();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (
    orderServiceId: number,
    payload: Parameters<typeof orderServicesApi.assignMechanic>[1],
  ) => {
    await orderServicesApi.assignMechanic(orderServiceId, payload);
    setSuccessMessage('Mechanic assigned.');
    onRefresh();
  };

  const handleUnassign = async () => {
    if (!activeModal || activeModal.type !== 'unassign') return;

    setActionLoading(true);
    setActionError(null);

    try {
      await orderServicesApi.unassignMechanic(activeModal.service.orderServiceId, {
        mechanicAssignmentId: activeModal.assignmentId,
      });
      setSuccessMessage('Mechanic unassigned.');
      setActiveModal(null);
      onRefresh();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestPart = async (
    orderServiceId: number,
    payload: Parameters<typeof orderServicesApi.requestPart>[1],
  ) => {
    await orderServicesApi.requestPart(orderServiceId, payload);
    setSuccessMessage('Part request submitted.');
    onRefresh();
  };

  const orderIsLocked =
    orderStatusId === ORDER_STATUS_IDS.cancelled ||
    orderStatusId === ORDER_STATUS_IDS.voided;

  const handleSaveService = async (
    payload: Parameters<typeof orderServicesApi.create>[0],
  ) => {
    if (serviceFormModal?.mode === 'edit') {
      await orderServicesApi.update(serviceFormModal.service.orderServiceId, payload);
      setSuccessMessage('Service line updated.');
    } else {
      await orderServicesApi.create(payload);
      setSuccessMessage('Service line added.');
    }
    onRefresh();
  };

  const handleDeleteService = async () => {
    if (!activeModal || activeModal.type !== 'delete') return;

    setActionLoading(true);
    setActionError(null);

    try {
      await orderServicesApi.delete(activeModal.service.orderServiceId);
      setSuccessMessage('Service line removed.');
      setActiveModal(null);
      onRefresh();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-border bg-bg-surface p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Services</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Line items on this order. Add, edit, or remove services when the order is open.
          </p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<Plus className="size-4" />}
          disabled={orderIsLocked}
          title={
            orderIsLocked
              ? 'Cannot add services to a cancelled or voided order'
              : undefined
          }
          onClick={() => setServiceFormModal({ mode: 'create' })}
        >
          Add service
        </Button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mt-4 rounded-lg border border-success/30 bg-success-muted/40 px-4 py-3 text-sm text-success"
        >
          {successMessage}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {actionError}
        </div>
      )}

      {services.length === 0 ? (
        <p className="mt-5 text-sm text-text-secondary">No services on this order yet.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {services.map((service) => (
            <article
              key={service.orderServiceId}
              className="rounded-lg border border-border bg-bg-muted/20 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {formatServiceTypeLabel(service.serviceTypeId, lookups)}
                    </h3>
                    <span className="text-xs text-text-muted">#{service.orderServiceId}</span>
                    {service.customerApproved !== undefined && (
                      <Badge variant={service.customerApproved ? 'active' : 'pending'}>
                        {service.customerApproved ? 'Client approved' : 'Pending approval'}
                      </Badge>
                    )}
                  </div>
                  {service.description && (
                    <p className="mt-1 text-sm text-text-secondary">{service.description}</p>
                  )}
                  <p className="mt-2 text-sm font-medium text-text-primary">
                    Labor: {formatCurrency(service.laborCost)}
                  </p>
                  {service.workPerformed && editingServiceId !== service.orderServiceId && (
                    <p className="mt-2 text-sm text-text-secondary">
                      <span className="font-medium text-text-primary">Work performed:</span>{' '}
                      {service.workPerformed}
                    </p>
                  )}
                  {service.approvalDate && (
                    <p className="mt-1 text-xs text-text-muted">
                      Approved {formatDateTime(service.approvalDate)}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Pencil className="size-4" />}
                    disabled={orderIsLocked}
                    title={
                      orderIsLocked
                        ? 'Cannot edit services on a cancelled or voided order'
                        : undefined
                    }
                    onClick={() => setServiceFormModal({ mode: 'edit', service })}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 className="size-4 text-danger" />}
                    disabled={orderIsLocked}
                    title={
                      orderIsLocked
                        ? 'Cannot delete services on a cancelled or voided order'
                        : undefined
                    }
                    onClick={() => setActiveModal({ type: 'delete', service })}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Wrench className="size-4" />}
                    onClick={() =>
                      editingServiceId === service.orderServiceId
                        ? cancelEditWorkReport()
                        : startEditWorkReport(service)
                    }
                  >
                    {editingServiceId === service.orderServiceId ? 'Cancel edit' : 'Work report'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<UserPlus className="size-4" />}
                    onClick={() => setActiveModal({ type: 'assign', service })}
                  >
                    Assign
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Plus className="size-4" />}
                    onClick={() => setActiveModal({ type: 'requestPart', service })}
                  >
                    Request part
                  </Button>
                </div>
              </div>

              {editingServiceId === service.orderServiceId && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <Textarea
                    name={`workPerformed-${service.orderServiceId}`}
                    label="Work performed"
                    value={workPerformed}
                    onChange={(event) => setWorkPerformed(event.target.value)}
                    rows={3}
                  />
                  <Input
                    name={`laborCost-${service.orderServiceId}`}
                    label="Labor cost"
                    type="number"
                    min={0}
                    step="0.01"
                    value={laborCost}
                    onChange={(event) => setLaborCost(event.target.value)}
                  />
                  <Button
                    size="sm"
                    isLoading={actionLoading}
                    onClick={() => void handleSaveWorkReport(service.orderServiceId)}
                  >
                    Save work report
                  </Button>
                </div>
              )}

              {service.mechanics.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Assigned mechanics
                  </p>
                  <ul className="mt-2 space-y-2">
                    {service.mechanics.map((mechanic) => (
                      <li
                        key={mechanic.mechanicAssignmentId}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-bg-surface px-3 py-2 text-sm"
                      >
                        <span className="text-text-primary">
                          Person #{mechanic.mechanicPersonId} ·{' '}
                          {formatSpecialtyLabel(mechanic.specialtyId, lookups)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<UserMinus className="size-4 text-danger" />}
                          onClick={() =>
                            setActiveModal({
                              type: 'unassign',
                              service,
                              assignmentId: mechanic.mechanicAssignmentId,
                            })
                          }
                        >
                          Unassign
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.parts.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Parts
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                    {service.parts.map((part) => (
                      <li key={part.orderServicePartId}>
                        Part #{part.partId} · Qty {part.quantity} ·{' '}
                        {formatCurrency(part.subtotal)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {activeModal?.type === 'assign' && (
        <AssignMechanicModal
          open
          orderServiceId={activeModal.service.orderServiceId}
          lookups={lookups}
          onClose={() => setActiveModal(null)}
          onSubmit={(payload) =>
            handleAssign(activeModal.service.orderServiceId, payload)
          }
        />
      )}

      {activeModal?.type === 'requestPart' && (
        <RequestPartModal
          open
          orderServiceId={activeModal.service.orderServiceId}
          onClose={() => setActiveModal(null)}
          onSubmit={(payload) =>
            handleRequestPart(activeModal.service.orderServiceId, payload)
          }
        />
      )}

      <ConfirmActionModal
        open={activeModal?.type === 'unassign'}
        onClose={() => setActiveModal(null)}
        onConfirm={() => void handleUnassign()}
        title="Unassign mechanic"
        description="Remove this mechanic assignment from the service line?"
        confirmLabel="Unassign"
        isLoading={actionLoading}
      />

      <ConfirmActionModal
        open={activeModal?.type === 'delete'}
        onClose={() => setActiveModal(null)}
        onConfirm={() => void handleDeleteService()}
        title="Delete service"
        description={`Remove service line #${activeModal?.type === 'delete' ? activeModal.service.orderServiceId : ''} from this order?`}
        confirmLabel="Delete service"
        isLoading={actionLoading}
      />

      <OrderServiceFormModal
        open={serviceFormModal !== null}
        mode={serviceFormModal?.mode ?? 'create'}
        serviceOrderId={serviceOrderId}
        initialService={serviceFormModal?.mode === 'edit' ? serviceFormModal.service : null}
        lookups={lookups}
        onClose={() => setServiceFormModal(null)}
        onSubmit={handleSaveService}
      />
    </section>
  );
}
