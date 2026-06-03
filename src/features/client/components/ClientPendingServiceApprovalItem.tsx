import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/format';
import type { ClientPendingServiceApprovalDto } from '@/features/client/types/clientApprovals.types';

export interface ClientPendingServiceApprovalItemProps {
  service: ClientPendingServiceApprovalDto;
  isActionRunning: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  onApprove: (orderServiceId: number) => void;
  onReject: (orderServiceId: number) => void;
}

export function ClientPendingServiceApprovalItem({
  service,
  isActionRunning,
  isApproving,
  isRejecting,
  onApprove,
  onReject,
}: ClientPendingServiceApprovalItemProps) {
  const serviceLabel =
    service.serviceTypeName ?? `ServiceType #${service.serviceTypeId}`;

  return (
    <article className="rounded-lg border border-border bg-bg-elevated p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-text-primary">{serviceLabel}</h4>
            <Badge variant="pending" dot>
              Service
            </Badge>
          </div>
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
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            size="sm"
            leftIcon={<CheckCircle2 className="size-4" />}
            isLoading={isApproving}
            disabled={isActionRunning}
            onClick={() => onApprove(service.orderServiceId)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<XCircle className="size-4" />}
            isLoading={isRejecting}
            disabled={isActionRunning}
            onClick={() => onReject(service.orderServiceId)}
          >
            Reject
          </Button>
        </div>
      </div>
    </article>
  );
}
