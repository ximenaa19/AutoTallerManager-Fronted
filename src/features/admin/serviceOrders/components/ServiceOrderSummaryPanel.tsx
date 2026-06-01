import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ServiceOrderFullDetailDto } from '@/features/admin/serviceOrders/types/serviceOrders.types';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { ServiceOrderStatusBadge } from '@/features/admin/serviceOrders/components/ServiceOrderStatusBadge';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';

export interface ServiceOrderSummaryPanelProps {
  order: ServiceOrderFullDetailDto;
  lookups: WorkshopCatalogLookups;
  onEdit?: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </dt>
      <dd className="text-sm text-text-primary">{value}</dd>
    </div>
  );
}

export function ServiceOrderSummaryPanel({
  order,
  lookups,
  onEdit,
}: ServiceOrderSummaryPanelProps) {
  const servicesTotal = order.services.reduce((sum, service) => sum + service.laborCost, 0);
  const partsTotal = order.services.reduce(
    (sum, service) =>
      sum + service.parts.reduce((partSum, part) => partSum + part.subtotal, 0),
    0,
  );

  return (
    <section className="rounded-lg border border-border bg-bg-surface p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Order summary</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Key dates, status, and financial snapshot. Edit header fields without changing workflow
            status.
          </p>
        </div>
        {onEdit && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Pencil className="size-4" />}
            onClick={onEdit}
          >
            Edit order
          </Button>
        )}
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Status
          </dt>
          <dd>
            <ServiceOrderStatusBadge
              orderStatusId={order.orderStatusId}
              catalogNameById={lookups.orderStatusNameById}
            />
          </dd>
        </div>
        <DetailRow label="Entry date" value={formatDateTime(order.entryDate)} />
        <DetailRow
          label="Estimated delivery"
          value={
            order.estimatedDeliveryDate
              ? formatDateTime(order.estimatedDeliveryDate)
              : '—'
          }
        />
        <DetailRow label="Created" value={formatDateTime(order.createdAt)} />
        <DetailRow label="Services labor total" value={formatCurrency(servicesTotal)} />
        <DetailRow label="Parts subtotal" value={formatCurrency(partsTotal)} />
        {order.cancellationReason && (
          <DetailRow label="Cancellation reason" value={order.cancellationReason} />
        )}
        {order.cancellationDate && (
          <DetailRow
            label="Cancellation date"
            value={formatDateTime(order.cancellationDate)}
          />
        )}
      </dl>

      {order.generalDescription && (
        <div className="mt-5 rounded-lg border border-border bg-bg-muted/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            General description
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-primary">
            {order.generalDescription}
          </p>
        </div>
      )}

      {order.inventory && (
        <div className="mt-5 space-y-3 border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-text-primary">Entry inventory</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailRow
              label="Scratches reported"
              value={order.inventory.hasScratches ? 'Yes' : 'No'}
            />
            {order.inventory.scratchesDescription && (
              <DetailRow
                label="Scratches detail"
                value={order.inventory.scratchesDescription}
              />
            )}
            <DetailRow
              label="Toolbox present"
              value={order.inventory.hasToolbox ? 'Yes' : 'No'}
            />
            {order.inventory.toolboxDescription && (
              <DetailRow
                label="Toolbox detail"
                value={order.inventory.toolboxDescription}
              />
            )}
            <DetailRow
              label="Ownership card delivered"
              value={order.inventory.ownershipCardDelivered ? 'Yes' : 'No'}
            />
            {order.inventory.observations && (
              <DetailRow label="Observations" value={order.inventory.observations} />
            )}
          </dl>
        </div>
      )}

      {order.invoice && (
        <div className="mt-5 space-y-3 border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-text-primary">Linked invoice</h3>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailRow label="Invoice #" value={order.invoice.invoiceNumber} />
            <DetailRow label="Date" value={formatDateTime(order.invoice.invoiceDate)} />
            <DetailRow label="Subtotal" value={formatCurrency(order.invoice.subtotal)} />
            <DetailRow label="Total" value={formatCurrency(order.invoice.total)} />
          </dl>
        </div>
      )}
    </section>
  );
}
