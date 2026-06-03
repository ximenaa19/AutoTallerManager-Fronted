import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  ClientApprovalStatusBadge,
  ClientServiceOrderStatusBadge,
} from '@/features/client/components/ClientServiceOrderStatusBadge';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type {
  ClientServiceOrderFullDetailDto,
  ClientServiceOrderPartSummaryDto,
  ClientServiceOrderServiceSummaryDto,
} from '@/features/client/types/clientServiceOrders.types';

export interface ClientServiceOrderDetailModalProps {
  serviceOrderId: number | null;
  detail: ClientServiceOrderFullDetailDto | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}

function hasPendingApprovals(detail: ClientServiceOrderFullDetailDto | null): boolean {
  if (!detail) {
    return false;
  }

  return detail.services.some(
    (service) =>
      service.customerApproved === null ||
      service.customerApproved === undefined ||
      service.parts?.some(
        (part) => part.customerApproved === null || part.customerApproved === undefined,
      ),
  );
}

function getServiceLabel(service: ClientServiceOrderServiceSummaryDto): string {
  return service.serviceTypeName ?? `ServiceType #${service.serviceTypeId}`;
}

function getPartLabel(part: ClientServiceOrderPartSummaryDto): string {
  return part.partName ?? `Part #${part.partId}`;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="text-text-primary">{value}</dd>
    </div>
  );
}

function ServicePartsList({ parts }: { parts?: ClientServiceOrderPartSummaryDto[] }) {
  if (!parts || parts.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-text-secondary">
        No parts registered for this service.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {parts.map((part) => (
        <div
          key={part.orderServicePartId}
          className="rounded-md border border-border bg-bg-surface px-3 py-2"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="font-medium text-text-primary">{getPartLabel(part)}</p>
              <p className="text-text-secondary">
                Quantity {part.quantity} · Unit {formatCurrency(part.appliedUnitPrice)}
              </p>
              <p className="text-text-primary">Subtotal: {formatCurrency(part.subtotal)}</p>
              {part.approvalDate ? (
                <p className="text-text-secondary">
                  Approval date: {formatDateTime(part.approvalDate)}
                </p>
              ) : null}
            </div>
            <ClientApprovalStatusBadge customerApproved={part.customerApproved} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ServicesSection({ services }: { services: ClientServiceOrderServiceSummaryDto[] }) {
  if (services.length === 0) {
    return (
      <EmptyState
        title="No services registered"
        description="This service order does not have service lines yet."
        className="rounded-lg border border-border bg-bg-elevated"
      />
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <article
          key={service.orderServiceId}
          className="rounded-lg border border-border bg-bg-elevated p-4"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h4 className="font-semibold text-text-primary">{getServiceLabel(service)}</h4>
              <p className="text-sm text-text-secondary">
                {service.description || 'No service description provided.'}
              </p>
              {service.workPerformed ? (
                <p className="text-sm text-text-secondary">
                  Work performed: {service.workPerformed}
                </p>
              ) : null}
              <p className="text-sm font-medium text-text-primary">
                Labor cost: {formatCurrency(service.laborCost)}
              </p>
              {service.approvalDate ? (
                <p className="text-sm text-text-secondary">
                  Approval date: {formatDateTime(service.approvalDate)}
                </p>
              ) : null}
            </div>
            <ClientApprovalStatusBadge customerApproved={service.customerApproved} />
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-text-primary">Parts</p>
            <ServicePartsList parts={service.parts} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function ClientServiceOrderDetailModal({
  serviceOrderId,
  detail,
  isLoading,
  error,
  onRetry,
  onClose,
}: ClientServiceOrderDetailModalProps) {
  if (serviceOrderId === null) {
    return null;
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Service order #${serviceOrderId}`}
      description="Read-only service order detail for your vehicle."
      size="lg"
    >
      {isLoading ? (
        <LoadingState
          title="Loading service order detail"
          description="Getting the full service order record."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load service order detail"
          message={error}
          onRetry={onRetry}
        />
      ) : !detail ? (
        <p className="text-sm text-text-secondary">No service order detail loaded.</p>
      ) : (
        <div className="space-y-5">
          {hasPendingApprovals(detail) ? (
            <div className="flex gap-3 rounded-lg border border-warning/30 bg-warning-muted/30 px-4 py-3 text-sm text-warning">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                Some services or parts are pending approval. Use Pending Approvals to approve or
                reject billable items.
              </p>
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Order information</CardTitle>
                <ClientServiceOrderStatusBadge orderStatusId={detail.orderStatusId} />
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <DetailField label="Service order ID" value={`#${detail.serviceOrderId}`} />
                <DetailField label="Vehicle ID" value={`#${detail.vehicleId}`} />
                {detail.vehiclePlate ? (
                  <DetailField label="Vehicle plate" value={detail.vehiclePlate} />
                ) : null}
                <DetailField label="Entry date" value={formatDateTime(detail.entryDate)} />
                <DetailField
                  label="Estimated delivery"
                  value={
                    detail.estimatedDeliveryDate
                      ? formatDateTime(detail.estimatedDeliveryDate)
                      : '—'
                  }
                />
                <DetailField label="Created at" value={formatDateTime(detail.createdAt)} />
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-text-muted">
                    General description
                  </dt>
                  <dd className="text-text-primary">
                    {detail.generalDescription || 'No description'}
                  </dd>
                </div>
                {detail.cancellationReason ? (
                  <div className="sm:col-span-2 rounded-md border border-danger/30 bg-danger-muted/20 p-3">
                    <dt className="text-xs uppercase tracking-wide text-danger">
                      Cancellation
                    </dt>
                    <dd className="text-text-primary">{detail.cancellationReason}</dd>
                    {detail.cancellationDate ? (
                      <dd className="mt-1 text-text-secondary">
                        {formatDateTime(detail.cancellationDate)}
                      </dd>
                    ) : null}
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intake inventory</CardTitle>
            </CardHeader>
            <CardContent>
              {detail.inventory ? (
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <DetailField
                    label="Has scratches"
                    value={detail.inventory.hasScratches ? 'Yes' : 'No'}
                  />
                  <DetailField
                    label="Has toolbox"
                    value={detail.inventory.hasToolbox ? 'Yes' : 'No'}
                  />
                  <DetailField
                    label="Ownership card delivered"
                    value={detail.inventory.ownershipCardDelivered ? 'Yes' : 'No'}
                  />
                  <DetailField
                    label="Registered at"
                    value={formatDateTime(detail.inventory.registeredAt)}
                  />
                  {detail.inventory.hasScratches ? (
                    <DetailField
                      label="Scratches description"
                      value={detail.inventory.scratchesDescription || 'No detail'}
                    />
                  ) : null}
                  {detail.inventory.hasToolbox ? (
                    <DetailField
                      label="Toolbox description"
                      value={detail.inventory.toolboxDescription || 'No detail'}
                    />
                  ) : null}
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-text-muted">
                      Observations
                    </dt>
                    <dd className="text-text-primary">
                      {detail.inventory.observations || 'No observations'}
                    </dd>
                  </div>
                </dl>
              ) : (
                <EmptyState
                  title="No intake inventory"
                  description="This service order does not have intake inventory details."
                  className="rounded-lg border border-border bg-bg-elevated"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Services and parts</CardTitle>
                <Badge variant="default">{detail.services.length} services</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ServicesSection services={detail.services} />
            </CardContent>
          </Card>
        </div>
      )}
    </Modal>
  );
}
