import { Link } from 'react-router-dom';
import { Car, ClipboardList, FileText, Package, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import { MechanicStatusBadge } from '@/features/mechanic/components/MechanicStatusBadge';
import { getWorkReportStatus } from '@/features/mechanic/utils/workReportStatus';
import type { MechanicAssignedServiceDto } from '@/features/mechanic/types/mechanicAssignments.types';
import {
  formatCustomerLabel,
  resolveServiceTypeName,
  resolveSpecialtyName,
} from '@/features/mechanic/utils/mechanicEnrichedLabels';
import { formatMechanicVehicleLabel } from '@/features/mechanic/utils/vehicleLabel';
import {
  mechanicRecordWorkPath,
  mechanicRequestPartsPath,
  mechanicServiceDetailPath,
} from '@/routes/routePaths';
import { formatCurrency } from '@/utils/format';

export interface MechanicAssignmentCardProps {
  assignment: MechanicAssignedServiceDto;
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

export function MechanicAssignmentCard({
  assignment,
  lookups,
}: MechanicAssignmentCardProps) {
  const serviceTypeName = resolveServiceTypeName(
    assignment.serviceTypeId,
    assignment.serviceTypeName,
    lookups,
  );
  const specialtyName = resolveSpecialtyName(
    assignment.specialtyId,
    assignment.specialtyName,
    lookups,
  );
  const customerLabel = formatCustomerLabel(
    assignment.customerName,
    assignment.customerDocumentNumber,
  );
  const workReportStatus = getWorkReportStatus(assignment.workPerformed);

  return (
    <Card padding="md" className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Wrench className="size-4 text-accent" aria-hidden />
            <h3 className="text-base font-semibold text-text-primary">
              {serviceTypeName}
            </h3>
          </div>
          <p className="text-sm text-text-secondary">
            Order service #{assignment.orderServiceId} · Order #{assignment.serviceOrderId}
          </p>
        </div>
        <MechanicStatusBadge
          workReportStatus={workReportStatus}
          customerApproved={assignment.customerApproved}
        />
      </div>

      {assignment.description && (
        <p className="text-sm leading-relaxed text-text-secondary">
          {assignment.description}
        </p>
      )}

      <dl className="grid gap-3 sm:grid-cols-2">
        <DetailItem
          label="Vehicle"
          value={formatMechanicVehicleLabel(
            assignment.vehicleId,
            assignment.vehiclePlate,
          )}
        />
        <DetailItem label="Specialty" value={specialtyName} />
        {customerLabel && <DetailItem label="Customer" value={customerLabel} />}
        <DetailItem label="Labor cost" value={formatCurrency(assignment.laborCost)} />
        <DetailItem
          label="Work performed"
          value={
            assignment.workPerformed?.trim()
              ? assignment.workPerformed
              : 'Not recorded yet'
          }
        />
      </dl>

      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Car className="size-3.5" aria-hidden />
            {formatMechanicVehicleLabel(assignment.vehicleId, assignment.vehiclePlate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClipboardList className="size-3.5" aria-hidden />
            Order #{assignment.serviceOrderId}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to={mechanicServiceDetailPath(assignment.orderServiceId)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            <FileText className="size-3.5" aria-hidden />
            View service detail
          </Link>
          <Link
            to={mechanicRecordWorkPath(assignment.orderServiceId)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            <Wrench className="size-3.5" aria-hidden />
            Record work
          </Link>
          <Link
            to={mechanicRequestPartsPath(assignment.orderServiceId)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            <Package className="size-3.5" aria-hidden />
            Request part
          </Link>
        </div>
      </div>
    </Card>
  );
}
