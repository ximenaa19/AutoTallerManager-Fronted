import { Car, ClipboardList } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import { MechanicStatusBadge } from '@/features/mechanic/components/MechanicStatusBadge';
import type { MechanicAssignedServiceDto } from '@/features/mechanic/types/mechanicAssignments.types';
import {
  formatCustomerLabel,
  resolveOrderStatusName,
  resolveServiceTypeName,
  resolveSpecialtyName,
} from '@/features/mechanic/utils/mechanicEnrichedLabels';
import { formatMechanicVehicleLabel } from '@/features/mechanic/utils/vehicleLabel';
import { getWorkReportStatus } from '@/features/mechanic/utils/workReportStatus';
import { formatCurrency, formatDateTime } from '@/utils/format';
export interface MechanicServiceContextCardProps {
  service: MechanicAssignedServiceDto;
  lookups: WorkshopCatalogLookups;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </dt>
      <dd className="text-sm text-text-primary">{value}</dd>
    </div>
  );
}

export function MechanicServiceContextCard({
  service,
  lookups,
}: MechanicServiceContextCardProps) {
  const serviceTypeName = resolveServiceTypeName(
    service.serviceTypeId,
    service.serviceTypeName,
    lookups,
  );
  const specialtyName = resolveSpecialtyName(
    service.specialtyId,
    service.specialtyName,
    lookups,
  );
  const orderStatusName = resolveOrderStatusName(
    service.orderStatusId,
    service.orderStatusName,
    lookups,
  );
  const customerLabel = formatCustomerLabel(
    service.customerName,
    service.customerDocumentNumber,
  );
  const workReportStatus = getWorkReportStatus(service.workPerformed);

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Assigned service
          </p>
          <h2 className="text-lg font-semibold text-text-primary">{serviceTypeName}</h2>
          <p className="text-sm text-text-secondary">
            Order service #{service.orderServiceId} · Service order #{service.serviceOrderId}
          </p>
        </div>
        <MechanicStatusBadge
          workReportStatus={workReportStatus}
          customerApproved={service.customerApproved}
        />
      </div>

      {service.description?.trim() && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Service description
          </p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            {service.description}
          </p>
        </div>
      )}

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem
          label="Vehicle"
          value={formatMechanicVehicleLabel(service.vehicleId, service.vehiclePlate)}
        />
        <DetailItem label="Specialty" value={specialtyName} />
        <DetailItem label="Order status" value={orderStatusName} />
        {customerLabel && <DetailItem label="Customer" value={customerLabel} />}
        {service.vehicleVin?.trim() && (
          <DetailItem label="VIN" value={service.vehicleVin.trim()} />
        )}
        {service.vehicleYear != null && (
          <DetailItem label="Year" value={String(service.vehicleYear)} />
        )}
        {service.vehicleColor?.trim() && (
          <DetailItem label="Color" value={service.vehicleColor.trim()} />
        )}
        <DetailItem label="Labor cost" value={formatCurrency(service.laborCost)} />
        <DetailItem
          label="Customer approval"
          value={
            service.customerApproved === true
              ? 'Approved'
              : service.customerApproved === false
                ? 'Rejected'
                : 'Pending'
          }
        />
        <DetailItem
          label="Approval date"
          value={
            service.approvalDate
              ? formatDateTime(service.approvalDate)
              : 'Not recorded'
          }
        />
        <DetailItem
          label="Work performed"
          value={
            service.workPerformed?.trim()
              ? service.workPerformed
              : 'Not recorded yet'
          }
        />
      </dl>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Car className="size-3.5" aria-hidden />
          {formatMechanicVehicleLabel(service.vehicleId, service.vehiclePlate)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ClipboardList className="size-3.5" aria-hidden />
          Order #{service.serviceOrderId}
        </span>
      </div>
    </Card>
  );
}
