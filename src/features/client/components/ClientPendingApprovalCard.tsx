import { Car, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ClientPendingPartApprovalItem } from '@/features/client/components/ClientPendingPartApprovalItem';
import { ClientPendingServiceApprovalItem } from '@/features/client/components/ClientPendingServiceApprovalItem';
import { formatDateTime } from '@/utils/format';
import type {
  ClientApprovalDecision,
  ClientApprovalItemType,
  ClientPendingApprovalDto,
} from '@/features/client/types/clientApprovals.types';

export interface ClientPendingApprovalCardProps {
  approval: ClientPendingApprovalDto;
  isActionRunning: boolean;
  isDecisionRunning: (
    type: ClientApprovalItemType,
    id: number,
    decision: ClientApprovalDecision,
  ) => boolean;
  onServiceApprove: (orderServiceId: number) => void;
  onServiceReject: (orderServiceId: number) => void;
  onPartApprove: (orderServicePartId: number) => void;
  onPartReject: (orderServicePartId: number) => void;
}

export function ClientPendingApprovalCard({
  approval,
  isActionRunning,
  isDecisionRunning,
  onServiceApprove,
  onServiceReject,
  onPartApprove,
  onPartReject,
}: ClientPendingApprovalCardProps) {
  const pendingServicesCount = approval.pendingServices.length;
  const pendingPartsCount = approval.pendingParts.length;
  const vehicleLabel = approval.vehiclePlate || `Vehicle #${approval.vehicleId}`;

  return (
    <Card padding="none" className="overflow-hidden">
      <CardHeader className="mb-0 border-b border-border bg-bg-elevated px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <ClipboardList className="size-5 text-accent" aria-hidden />
              <CardTitle>Service order #{approval.serviceOrderId}</CardTitle>
              <Badge variant="pending" dot>
                Pending approval
              </Badge>
            </div>
            <div className="grid gap-1 text-sm text-text-secondary">
              <p className="flex flex-wrap items-center gap-2">
                <Car className="size-4" aria-hidden />
                <span>{vehicleLabel}</span>
              </p>
              <p>Entry date: {formatDateTime(approval.entryDate)}</p>
              <p>Status #{approval.orderStatusId}</p>
              <p>{approval.generalDescription || 'No general description provided.'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{pendingServicesCount} services</Badge>
            <Badge variant="default">{pendingPartsCount} parts</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-text-primary">Pending services</h3>
            <span className="text-xs text-text-secondary">{pendingServicesCount} pending</span>
          </div>
          {pendingServicesCount === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-text-secondary">
              No pending services for this order.
            </p>
          ) : (
            <div className="space-y-3">
              {approval.pendingServices.map((service) => (
                <ClientPendingServiceApprovalItem
                  key={service.orderServiceId}
                  service={service}
                  isActionRunning={isActionRunning}
                  isApproving={isDecisionRunning('service', service.orderServiceId, 'approve')}
                  isRejecting={isDecisionRunning('service', service.orderServiceId, 'reject')}
                  onApprove={onServiceApprove}
                  onReject={onServiceReject}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-text-primary">Pending parts</h3>
            <span className="text-xs text-text-secondary">{pendingPartsCount} pending</span>
          </div>
          {pendingPartsCount === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-text-secondary">
              No pending parts for this order.
            </p>
          ) : (
            <div className="space-y-3">
              {approval.pendingParts.map((part) => (
                <ClientPendingPartApprovalItem
                  key={part.orderServicePartId}
                  part={part}
                  isActionRunning={isActionRunning}
                  isApproving={isDecisionRunning('part', part.orderServicePartId, 'approve')}
                  isRejecting={isDecisionRunning('part', part.orderServicePartId, 'reject')}
                  onApprove={onPartApprove}
                  onReject={onPartReject}
                />
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
